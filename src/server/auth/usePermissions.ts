import { ref, computed } from 'vue'

export interface Permission {
  id: string
  name: string
  description?: string
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  inherits?: string[]
  isSystem?: boolean
}

export interface UserPermissions {
  userId: string
  roles: Role[]
  permissions: Permission[]
  effectivePermissions: Set<string>
}

export interface UsePermissionsOptions {
  cacheTimeout?: number
  enableCache?: boolean
  fallbackPermission?: boolean
}

export function usePermissions(options: UsePermissionsOptions = {}) {
  const {
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    enableCache = true,
    fallbackPermission = false
  } = options

  const userPermissions = ref<UserPermissions | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const lastUpdated = ref<number>(0)

  const isLoading = computed(() => loading.value)
  const lastError = computed(() => error.value)
  const hasData = computed(() => userPermissions.value !== null)

  // Generate permission key
  const getPermissionKey = (resource: string, action: string): string => {
    return `${resource}:${action}`
  }

  // Check if user has specific permission
  const hasPermission = (resource: string, action: string, conditions?: Record<string, any>): boolean => {
    if (!userPermissions.value) return fallbackPermission

    const permissionKey = getPermissionKey(resource, action)
    
    // Check direct permissions
    if (userPermissions.value.effectivePermissions.has(permissionKey)) {
      // Check conditions if provided
      if (conditions) {
        const permission = userPermissions.value.permissions.find(
          p => getPermissionKey(p.resource, p.action) === permissionKey
        )
        
        if (permission?.conditions) {
          return evaluateConditions(permission.conditions, conditions)
        }
      }
      return true
    }

    return fallbackPermission
  }

  // Check if user has any of the provided permissions
  const hasAnyPermission = (permissions: Array<{ resource: string; action: string }>): boolean => {
    return permissions.some(({ resource, action }) => hasPermission(resource, action))
  }

  // Check if user has all provided permissions
  const hasAllPermissions = (permissions: Array<{ resource: string; action: string }>): boolean => {
    return permissions.every(({ resource, action }) => hasPermission(resource, action))
  }

  // Check if user has specific role
  const hasRole = (roleName: string): boolean => {
    if (!userPermissions.value) return false
    return userPermissions.value.roles.some(role => role.name === roleName)
  }

  // Check if user has any of the provided roles
  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!userPermissions.value) return false
    return roleNames.some(roleName => hasRole(roleName))
  }

  // Get all user roles
  const getUserRoles = computed(() => {
    return userPermissions.value?.roles || []
  })

  // Get all user permissions
  const getUserPermissions = computed(() => {
    return userPermissions.value?.permissions || []
  })

  // Evaluate permission conditions
  const evaluateConditions = (permissionConditions: Record<string, any>, context: Record<string, any>): boolean => {
    for (const [key, value] of Object.entries(permissionConditions)) {
      if (!(key in context)) return false
      if (context[key] !== value) return false
    }
    return true
  }

  // Calculate effective permissions (including inherited)
  const calculateEffectivePermissions = (roles: Role[], permissions: Permission[]): Set<string> => {
    const effective = new Set<string>()
    const processedRoles = new Set<string>()

    // Add direct permissions
    permissions.forEach(permission => {
      effective.add(getPermissionKey(permission.resource, permission.action))
    })

    // Process role inheritance
    const processRole = (role: Role) => {
      if (processedRoles.has(role.id)) return
      processedRoles.add(role.id)

      // Add role permissions
      role.permissions.forEach(permissionId => {
        const permission = permissions.find(p => p.id === permissionId)
        if (permission) {
          effective.add(getPermissionKey(permission.resource, permission.action))
        }
      })

      // Process inherited roles
      if (role.inherits) {
        role.inherits.forEach(inheritedRoleId => {
          const inheritedRole = roles.find(r => r.id === inheritedRoleId)
          if (inheritedRole) {
            processRole(inheritedRole)
          }
        })
      }
    }

    roles.forEach(processRole)
    return effective
  }

  // Load user permissions
  const loadPermissions = async (userId: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // This would typically fetch from your API
      const response = await fetch(`/api/auth/users/${userId}/permissions`)
      
      if (!response.ok) {
        throw new Error('Failed to load permissions')
      }

      const data = await response.json()
      
      const roles: Role[] = data.roles || []
      const permissions: Permission[] = data.permissions || []
      const effectivePermissions = calculateEffectivePermissions(roles, permissions)

      userPermissions.value = {
        userId,
        roles,
        permissions,
        effectivePermissions
      }

      lastUpdated.value = Date.now()

    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      loading.value = false
    }
  }

  // Refresh permissions
  const refreshPermissions = async (): Promise<void> => {
    if (userPermissions.value) {
      await loadPermissions(userPermissions.value.userId)
    }
  }

  // Clear permissions
  const clearPermissions = (): void => {
    userPermissions.value = null
    lastUpdated.value = 0
  }

  // Check if cache is expired
  const isCacheExpired = (): boolean => {
    return Date.now() - lastUpdated.value > cacheTimeout
  }

  // Auto-refresh if cache expired
  const ensureFreshPermissions = async (): Promise<void> => {
    if (enableCache && userPermissions.value && isCacheExpired()) {
      await refreshPermissions()
    }
  }

  // Permission guard function
  const createPermissionGuard = (
    requiredPermissions: Array<{ resource: string; action: string }>,
    options: { requireAll?: boolean; fallbackRoute?: string } = {}
  ) => {
    const { requireAll = true, fallbackRoute } = options

    return {
      canAccess: (): boolean => {
        return requireAll 
          ? hasAllPermissions(requiredPermissions)
          : hasAnyPermission(requiredPermissions)
      },
      
      guard: (to: any, from: any, next: any) => {
        const canAccess = requireAll 
          ? hasAllPermissions(requiredPermissions)
          : hasAnyPermission(requiredPermissions)

        if (canAccess) {
          next()
        } else if (fallbackRoute) {
          next(fallbackRoute)
        } else {
          next(false)
        }
      }
    }
  }

  return {
    // State
    userPermissions,
    loading: isLoading,
    error: lastError,
    hasData,
    userRoles: getUserRoles,
    userPermissionsList: getUserPermissions,
    
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    
    // Actions
    loadPermissions,
    refreshPermissions,
    clearPermissions,
    ensureFreshPermissions,
    
    // Utilities
    createPermissionGuard,
    getPermissionKey
  }
}
