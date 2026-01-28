import { ref, computed } from 'vue'

export interface ConflictDetectionOptions {
  strategy?: 'timestamp' | 'version' | 'hash' | 'custom'
  timestampField?: string
  versionField?: string
  hashFields?: string[]
  customResolver?: (client: any, server: any) => boolean
}

export interface ConflictInfo<T = any> {
  id: string
  type: 'update' | 'delete' | 'create'
  clientData: T
  serverData: T
  detectedAt: number
  severity: 'low' | 'medium' | 'high'
  autoResolvable: boolean
}

export interface ConflictResolution<T = any> {
  conflict: ConflictInfo<T>
  resolution: 'client' | 'server' | 'merge' | 'manual'
  resolvedData: T
  resolvedAt: number
  resolvedBy: 'auto' | 'user'
}

export interface ConflictStats {
  totalConflicts: number
  resolvedConflicts: number
  pendingConflicts: number
  autoResolved: number
  manuallyResolved: number
  averageResolutionTime: number
}

export function useConflictResolution<T = any>(options: ConflictDetectionOptions = {}) {
  const {
    strategy = 'timestamp',
    timestampField = 'updatedAt',
    versionField = 'version',
    hashFields = [],
    customResolver
  } = options

  const loading = ref(false)
  const error = ref<Error | null>(null)
  const conflicts = ref<ConflictInfo<T>[]>([])
  const resolutions = ref<ConflictResolution<T>[]>([])

  const isLoading = computed(() => loading.value)
  const lastError = computed(() => error.value)
  const pendingConflicts = computed(() => 
    conflicts.value.filter(conflict => 
      !resolutions.value.some(res => res.conflict.id === conflict.id)
    )
  )
  const resolvedConflicts = computed(() => resolutions.value)
  const conflictStats = computed<ConflictStats>(() => {
    const total = conflicts.value.length
    const resolved = resolutions.value.length
    const pending = total - resolved
    const autoResolved = resolutions.value.filter(res => res.resolvedBy === 'auto').length
    const manuallyResolved = resolutions.value.filter(res => res.resolvedBy === 'user').length
    
    const resolutionTimes = resolutions.value.map(res => 
      res.resolvedAt - res.conflict.detectedAt
    )
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0

    return {
      totalConflicts: total,
      resolvedConflicts: resolved,
      pendingConflicts: pending,
      autoResolved,
      manuallyResolved,
      averageResolutionTime: avgResolutionTime
    }
  })

  // Generate hash for object
  const generateHash = (data: T): string => {
    if (hashFields.length === 0) {
      return btoa(JSON.stringify(data))
    }

    const hashData: any = {}
    hashFields.forEach(field => {
      if (data && typeof data === 'object' && field in data) {
        hashData[field] = (data as any)[field]
      }
    })

    return btoa(JSON.stringify(hashData))
  }

  // Detect conflict using different strategies
  const detectConflict = (clientData: T, serverData: T): ConflictInfo<T> | null => {
    if (!clientData || !serverData) {
      return null
    }

    let hasConflict = false
    let severity: 'low' | 'medium' | 'high' = 'medium'

    switch (strategy) {
      case 'timestamp':
        const clientTimestamp = (clientData as any)[timestampField]
        const serverTimestamp = (serverData as any)[timestampField]
        
        if (clientTimestamp && serverTimestamp) {
          hasConflict = clientTimestamp > serverTimestamp
          severity = hasConflict ? 'high' : 'low'
        }
        break

      case 'version':
        const clientVersion = (clientData as any)[versionField]
        const serverVersion = (serverData as any)[versionField]
        
        if (clientVersion !== undefined && serverVersion !== undefined) {
          hasConflict = clientVersion !== serverVersion
          severity = hasConflict ? 'medium' : 'low'
        }
        break

      case 'hash':
        const clientHash = generateHash(clientData)
        const serverHash = generateHash(serverData)
        hasConflict = clientHash !== serverHash
        severity = hasConflict ? 'medium' : 'low'
        break

      case 'custom':
        if (customResolver) {
          hasConflict = !customResolver(clientData, serverData)
          severity = hasConflict ? 'medium' : 'low'
        }
        break
    }

    if (!hasConflict) {
      return null
    }

    const conflictId = `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const autoResolvable = strategy === 'timestamp' || strategy === 'version'

    return {
      id: conflictId,
      type: 'update',
      clientData,
      serverData,
      detectedAt: Date.now(),
      severity,
      autoResolvable
    }
  }

  // Add conflict to list
  const addConflict = (clientData: T, serverData: T): ConflictInfo<T> | null => {
    const conflict = detectConflict(clientData, serverData)
    
    if (conflict) {
      conflicts.value.push(conflict)
    }

    return conflict
  }

  // Remove conflict
  const removeConflict = (conflictId: string): boolean => {
    const index = conflicts.value.findIndex(conflict => conflict.id === conflictId)
    if (index >= 0) {
      conflicts.value.splice(index, 1)
      return true
    }
    return false
  }

  // Auto-resolve conflict
  const autoResolve = (conflict: ConflictInfo<T>): ConflictResolution<T> | null => {
    if (!conflict.autoResolvable) {
      return null
    }

    let resolvedData: T
    let resolution: ConflictResolution<T>['resolution']

    switch (strategy) {
      case 'timestamp':
        const clientTimestamp = (conflict.clientData as any)[timestampField]
        const serverTimestamp = (conflict.serverData as any)[timestampField]
        resolvedData = clientTimestamp > serverTimestamp ? conflict.clientData : conflict.serverData
        resolution = clientTimestamp > serverTimestamp ? 'client' : 'server'
        break

      case 'version':
        const clientVersion = (conflict.clientData as any)[versionField]
        const serverVersion = (conflict.serverData as any)[versionField]
        resolvedData = clientVersion > serverVersion ? conflict.clientData : conflict.serverData
        resolution = clientVersion > serverVersion ? 'client' : 'server'
        break

      default:
        resolvedData = conflict.serverData
        resolution = 'server'
        break
    }

    const resolutionInfo: ConflictResolution<T> = {
      conflict,
      resolution,
      resolvedData,
      resolvedAt: Date.now(),
      resolvedBy: 'auto'
    }

    resolutions.value.push(resolutionInfo)
    return resolutionInfo
  }

  // Manual conflict resolution
  const manualResolve = (
    conflictId: string,
    resolution: 'client' | 'server' | 'merge',
    mergedData?: T
  ): ConflictResolution<T> | null => {
    const conflict = conflicts.value.find(c => c.id === conflictId)
    if (!conflict) {
      return null
    }

    let resolvedData: T

    switch (resolution) {
      case 'client':
        resolvedData = conflict.clientData
        break

      case 'server':
        resolvedData = conflict.serverData
        break

      case 'merge':
        if (mergedData) {
          resolvedData = mergedData
        } else {
          // Simple merge strategy
          resolvedData = { ...conflict.serverData, ...conflict.clientData } as T
        }
        break

      default:
        return null
    }

    const resolutionInfo: ConflictResolution<T> = {
      conflict,
      resolution,
      resolvedData,
      resolvedAt: Date.now(),
      resolvedBy: 'user'
    }

    resolutions.value.push(resolutionInfo)
    return resolutionInfo
  }

  // Auto-resolve all resolvable conflicts
  const autoResolveAll = (): ConflictResolution<T>[] => {
    const autoResolvable = conflicts.value.filter(conflict => 
      conflict.autoResolvable && 
      !resolutions.value.some(res => res.conflict.id === conflict.id)
    )

    const autoResolutions: ConflictResolution<T>[] = []

    for (const conflict of autoResolvable) {
      const resolution = autoResolve(conflict)
      if (resolution) {
        autoResolutions.push(resolution)
      }
    }

    return autoResolutions
  }

  // Get conflict by ID
  const getConflict = (conflictId: string): ConflictInfo<T> | undefined => {
    return conflicts.value.find(conflict => conflict.id === conflictId)
  }

  // Get resolution by conflict ID
  const getResolution = (conflictId: string): ConflictResolution<T> | undefined => {
    return resolutions.value.find(resolution => resolution.conflict.id === conflictId)
  }

  // Clear all conflicts
  const clearConflicts = (): void => {
    conflicts.value = []
    resolutions.value = []
  }

  // Clear resolved conflicts
  const clearResolved = (): void => {
    const resolvedConflictIds = resolutions.value.map(res => res.conflict.id)
    conflicts.value = conflicts.value.filter(conflict => 
      !resolvedConflictIds.includes(conflict.id)
    )
  }

  // Check for conflicts in data array
  const detectConflictsInArray = (
    clientData: T[], 
    serverData: T[], 
    idField: string = 'id'
  ): ConflictInfo<T>[] => {
    const detectedConflicts: ConflictInfo<T>[] = []

    for (const clientItem of clientData) {
      const clientItemId = (clientItem as any)[idField]
      const serverItem = serverData.find(item => (item as any)[idField] === clientItemId)

      if (serverItem) {
        const conflict = detectConflict(clientItem, serverItem)
        if (conflict) {
          detectedConflicts.push(conflict)
        }
      }
    }

    conflicts.value.push(...detectedConflicts)
    return detectedConflicts
  }

  // Merge data with conflict resolution
  const mergeWithResolution = (
    clientData: T[], 
    serverData: T[], 
    idField: string = 'id'
  ): T[] => {
    const mergedData: T[] = []
    const processedIds = new Set<any>()

    // Process server data
    for (const serverItem of serverData) {
      const serverItemId = (serverItem as any)[idField]
      const clientItem = clientData.find(item => (item as any)[idField] === serverItemId)
      
      if (clientItem) {
        const conflict = detectConflict(clientItem, serverItem)
        
        if (conflict) {
          const resolution = getResolution(conflict.id)
          if (resolution) {
            mergedData.push(resolution.resolvedData)
          } else if (conflict.autoResolvable) {
            const autoResolution = autoResolve(conflict)
            mergedData.push(autoResolution?.resolvedData || serverItem)
          } else {
            // Keep server data for unresolved conflicts
            mergedData.push(serverItem)
          }
        } else {
          // No conflict, use client data (more recent)
          mergedData.push(clientItem)
        }
      } else {
        // Only exists on server
        mergedData.push(serverItem)
      }

      processedIds.add(serverItemId)
    }

    // Add client-only items
    for (const clientItem of clientData) {
      const clientItemId = (clientItem as any)[idField]
      if (!processedIds.has(clientItemId)) {
        mergedData.push(clientItem)
      }
    }

    return mergedData
  }

  return {
    // State
    loading: isLoading,
    error: lastError,
    conflicts,
    resolutions,
    pendingConflicts,
    resolvedConflicts,
    conflictStats,
    
    // Actions
    detectConflict,
    addConflict,
    removeConflict,
    autoResolve,
    manualResolve,
    autoResolveAll,
    getConflict,
    getResolution,
    clearConflicts,
    clearResolved,
    detectConflictsInArray,
    mergeWithResolution
  }
}
