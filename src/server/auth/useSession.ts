import { ref, computed } from 'vue'

export interface SessionData {
  id: string
  userId: string
  token: string
  refreshToken?: string
  expiresAt: number
  createdAt: number
  lastAccessAt: number
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export interface SessionConfig {
  storageKey?: string
  autoRefresh?: boolean
  refreshThreshold?: number // milliseconds before expiry
  maxInactivity?: number // milliseconds of inactivity before logout
  trackActivity?: boolean
}

export interface UseSessionOptions extends SessionConfig {
  apiEndpoints?: {
    validate: string
    refresh: string
    logout: string
  }
}

export function useSession(options: UseSessionOptions = {}) {
  const {
    storageKey = 'session_data',
    autoRefresh = true,
    refreshThreshold = 5 * 60 * 1000, // 5 minutes
    maxInactivity = 30 * 60 * 1000, // 30 minutes
    trackActivity = true,
    apiEndpoints = {
      validate: '/api/auth/session/validate',
      refresh: '/api/auth/session/refresh',
      logout: '/api/auth/session/logout'
    }
  } = options

  const session = ref<SessionData | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const isValid = ref(false)

  const isLoading = computed(() => loading.value)
  const lastError = computed(() => error.value)
  const isSessionValid = computed(() => isValid.value && session.value !== null)
  const isExpired = computed(() => {
    if (!session.value) return true
    return Date.now() >= session.value.expiresAt
  })
  const isInactivityExpired = computed(() => {
    if (!session.value || !maxInactivity) return false
    return Date.now() - session.value.lastAccessAt > maxInactivity
  })
  const needsRefresh = computed(() => {
    if (!session.value || !autoRefresh) return false
    const timeUntilExpiry = session.value.expiresAt - Date.now()
    return timeUntilExpiry <= refreshThreshold
  })

  let refreshTimer: NodeJS.Timeout | null = null
  let activityTimer: NodeJS.Timeout | null = null

  // Storage management
  const getSessionFromStorage = (): SessionData | null => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  const saveSessionToStorage = (sessionData: SessionData | null): void => {
    try {
      if (sessionData) {
        localStorage.setItem(storageKey, JSON.stringify(sessionData))
      } else {
        localStorage.removeItem(storageKey)
      }
    } catch {
      // Ignore storage errors
    }
  }

  // Update session activity
  const updateActivity = (): void => {
    if (session.value && trackActivity) {
      session.value.lastAccessAt = Date.now()
      saveSessionToStorage(session.value)
    }
  }

  // Validate session
  const validateSession = async (): Promise<boolean> => {
    if (!session.value) return false

    loading.value = true
    error.value = null

    try {
      const response = await fetch(apiEndpoints.validate, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.value.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId: session.value.id })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update session with server data
        session.value = {
          ...session.value,
          ...data.session,
          lastAccessAt: Date.now()
        }
        
        isValid.value = true
        saveSessionToStorage(session.value)
        return true
      } else {
        // Session invalid
        await invalidateSession()
        return false
      }

    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      isValid.value = false
      return false
    } finally {
      loading.value = false
    }
  }

  // Refresh session
  const refreshSession = async (): Promise<boolean> => {
    if (!session.value || !session.value.refreshToken) return false

    loading.value = true
    error.value = null

    try {
      const response = await fetch(apiEndpoints.refresh, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: session.value.id,
          refreshToken: session.value.refreshToken
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        session.value = {
          ...session.value,
          token: data.token,
          refreshToken: data.refreshToken || session.value.refreshToken,
          expiresAt: data.expiresAt || session.value.expiresAt,
          lastAccessAt: Date.now()
        }
        
        isValid.value = true
        saveSessionToStorage(session.value)
        setupRefreshTimer()
        return true
      } else {
        // Refresh failed, invalidate session
        await invalidateSession()
        return false
      }

    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      await invalidateSession()
      return false
    } finally {
      loading.value = false
    }
  }

  // Create new session
  const createSession = (sessionData: Omit<SessionData, 'id' | 'createdAt' | 'lastAccessAt'>): SessionData => {
    const newSession: SessionData = {
      ...sessionData,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      lastAccessAt: Date.now()
    }

    session.value = newSession
    isValid.value = true
    saveSessionToStorage(newSession)
    setupRefreshTimer()
    setupActivityTimer()

    return newSession
  }

  // Invalidate session
  const invalidateSession = async (): Promise<void> => {
    if (session.value) {
      try {
        await fetch(apiEndpoints.logout, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.value.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId: session.value.id })
        })
      } catch {
        // Ignore logout errors
      }
    }

    session.value = null
    isValid.value = false
    saveSessionToStorage(null)
    clearTimers()
  }

  // Setup refresh timer
  const setupRefreshTimer = (): void => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }

    if (!autoRefresh || !session.value) return

    const checkInterval = 60 * 1000 // Check every minute

    refreshTimer = setInterval(async () => {
      if (needsRefresh.value && !loading.value) {
        await refreshSession()
      }
    }, checkInterval)
  }

  // Setup activity timer
  const setupActivityTimer = (): void => {
    if (activityTimer) {
      clearInterval(activityTimer)
    }

    if (!trackActivity || !maxInactivity || !session.value) return

    activityTimer = setInterval(() => {
      if (isInactivityExpired.value) {
        invalidateSession()
      }
    }, 60 * 1000) // Check every minute
  }

  // Clear all timers
  const clearTimers = (): void => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
    if (activityTimer) {
      clearInterval(activityTimer)
      activityTimer = null
    }
  }

  // Initialize session from storage
  const initialize = (): void => {
    const storedSession = getSessionFromStorage()
    
    if (storedSession && !isExpired.value && !isInactivityExpired.value) {
      session.value = storedSession
      isValid.value = true
      setupRefreshTimer()
      setupActivityTimer()
      
      // Validate with server
      validateSession().catch(() => {
        // If validation fails, session will be invalidated
      })
    } else {
      // Clear invalid session
      saveSessionToStorage(null)
    }
  }

  // Get session token
  const getToken = (): string | null => {
    return session.value?.token || null
  }

  // Get session headers
  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // Update session metadata
  const updateMetadata = (metadata: Record<string, any>): void => {
    if (session.value) {
      session.value.metadata = { ...session.value.metadata, ...metadata }
      saveSessionToStorage(session.value)
    }
  }

  // Extend session
  const extendSession = (additionalTime: number): void => {
    if (session.value) {
      session.value.expiresAt = Date.now() + additionalTime
      saveSessionToStorage(session.value)
      setupRefreshTimer()
    }
  }

  // Auto-initialize
  initialize()

  // Setup global activity tracking
  if (trackActivity && typeof window !== 'undefined') {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    const handleActivity = () => {
      updateActivity()
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Cleanup on unmount
    if (typeof onUnmounted === 'function') {
      onUnmounted(() => {
        activityEvents.forEach(event => {
          document.removeEventListener(event, handleActivity)
        })
      })
    }
  }

  return {
    // State
    session,
    loading: isLoading,
    error: lastError,
    isValid: isSessionValid,
    isExpired,
    isInactivityExpired,
    needsRefresh,
    
    // Actions
    createSession,
    validateSession,
    refreshSession,
    invalidateSession,
    updateActivity,
    updateMetadata,
    extendSession,
    
    // Utilities
    getToken,
    getAuthHeaders,
    
    // Internal
    initialize,
    clearTimers
  }
}
