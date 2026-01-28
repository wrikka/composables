import { ref, computed } from 'vue'

export interface PresenceUser {
  id: string
  name: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: number
  currentRoom?: string
  metadata?: Record<string, any>
}

export interface PresenceConfig {
  heartbeatInterval?: number
  offlineTimeout?: number
  awayTimeout?: number
  trackRooms?: boolean
  enableStatus?: boolean
}

export function useSocketPresence(websocket: any, config: PresenceConfig = {}) {
  const {
    heartbeatInterval = 30000, // 30 seconds
    offlineTimeout = 60000, // 1 minute
    awayTimeout = 300000, // 5 minutes
    trackRooms = true,
    enableStatus = true
  } = config

  const users = ref<Map<string, PresenceUser>>(new Map())
  const currentUser = ref<PresenceUser | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const isLoading = computed(() => loading.value)
  const lastError = computed(() => error.value)
  const onlineUsers = computed(() => 
    Array.from(users.value.values()).filter(user => user.status !== 'offline')
  )
  const userCount = computed(() => onlineUsers.value.length)
  const isOnline = computed(() => currentUser.value?.status !== 'offline')

  let heartbeatTimer: NodeJS.Timeout | null = null
  let awayTimer: NodeJS.Timeout | null = null
  let lastActivity = Date.now()

  // Update current user
  const updateCurrentUser = (userData: Partial<PresenceUser>): void => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...userData }
      
      // Broadcast presence update
      websocket.send({
        type: 'presence:update',
        data: {
          user: currentUser.value,
          timestamp: Date.now()
        }
      })
    }
  }

  // Set user status
  const setStatus = (status: PresenceUser['status']): void => {
    if (!enableStatus) return
    
    updateCurrentUser({ status, lastSeen: Date.now() })
  }

  // Set user as online
  const setOnline = (): void => {
    setStatus('online')
    resetAwayTimer()
  }

  // Set user as away
  const setAway = (): void => {
    setStatus('away')
  }

  // Set user as busy
  const setBusy = (): void => {
    setStatus('busy')
  }

  // Update current room
  const setCurrentRoom = (roomName?: string): void => {
    if (!trackRooms) return
    
    updateCurrentUser({ currentRoom: roomName })
  }

  // Update user metadata
  const updateMetadata = (metadata: Record<string, any>): void => {
    const currentMetadata = currentUser.value?.metadata || {}
    updateCurrentUser({ 
      metadata: { ...currentMetadata, ...metadata }
    })
  }

  // Get user by ID
  const getUser = (userId: string): PresenceUser | undefined => {
    return users.value.get(userId)
  }

  // Get users by status
  const getUsersByStatus = (status: PresenceUser['status']): PresenceUser[] => {
    return Array.from(users.value.values()).filter(user => user.status === status)
  }

  // Get users in room
  const getUsersInRoom = (roomName: string): PresenceUser[] => {
    return Array.from(users.value.values()).filter(user => 
      user.currentRoom === roomName && user.status !== 'offline'
    )
  }

  // Check if user is online
  const isUserOnline = (userId: string): boolean => {
    const user = users.value.get(userId)
    return user ? user.status !== 'offline' : false
  }

  // Add user
  const addUser = (user: PresenceUser): void => {
    users.value.set(user.id, user)
  }

  // Remove user
  const removeUser = (userId: string): void => {
    users.value.delete(userId)
  }

  // Update user
  const updateUser = (userId: string, updates: Partial<PresenceUser>): void => {
    const user = users.value.get(userId)
    if (user) {
      users.value.set(userId, { ...user, ...updates })
    }
  }

  // Mark user as offline
  const markUserOffline = (userId: string): void => {
    updateUser(userId, { status: 'offline', lastSeen: Date.now() })
  }

  // Clean up offline users
  const cleanupOfflineUsers = (): void => {
    const now = Date.now()
    const usersToRemove: string[] = []

    for (const [userId, user] of users.value) {
      if (user.status === 'offline' && now - user.lastSeen > offlineTimeout * 2) {
        usersToRemove.push(userId)
      }
    }

    usersToRemove.forEach(userId => removeUser(userId))
  }

  // Start heartbeat
  const startHeartbeat = (): void => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
    }

    heartbeatTimer = setInterval(() => {
      if (currentUser.value && isOnline.value) {
        websocket.send({
          type: 'presence:heartbeat',
          data: {
            userId: currentUser.value.id,
            timestamp: Date.now(),
            currentRoom: currentUser.value.currentRoom
          }
        })
      }
    }, heartbeatInterval)
  }

  // Stop heartbeat
  const stopHeartbeat = (): void => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // Reset away timer
  const resetAwayTimer = (): void => {
    if (awayTimer) {
      clearTimeout(awayTimer)
    }

    lastActivity = Date.now()

    awayTimer = setTimeout(() => {
      if (currentUser.value?.status === 'online') {
        setAway()
      }
    }, awayTimeout)
  }

  // Track user activity
  const trackActivity = (): void => {
    if (currentUser.value?.status === 'away') {
      setOnline()
    }
    resetAwayTimer()
  }

  // Initialize current user
  const initializeUser = (userData: Omit<PresenceUser, 'lastSeen'>): void => {
    currentUser.value = {
      ...userData,
      lastSeen: Date.now()
    }

    // Broadcast initial presence
    websocket.send({
      type: 'presence:init',
      data: {
        user: currentUser.value,
        timestamp: Date.now()
      }
    })

    startHeartbeat()
    resetAwayTimer()
  }

  // Setup WebSocket event listeners
  const setupEventListeners = (): void => {
    // Presence update received
    websocket.on('presence:update', (data: any) => {
      const user = data.user as PresenceUser
      updateUser(user.id, user)
    })

    // User came online
    websocket.on('presence:online', (data: any) => {
      const user = data.user as PresenceUser
      addUser(user)
    })

    // User went offline
    websocket.on('presence:offline', (data: any) => {
      const userId = data.userId
      markUserOffline(userId)
    })

    // User joined room
    websocket.on('presence:joined_room', (data: any) => {
      const { userId, room } = data
      updateUser(userId, { currentRoom: room })
    })

    // User left room
    websocket.on('presence:left_room', (data: any) => {
      const { userId } = data
      updateUser(userId, { currentRoom: undefined })
    })

    // Initial presence list
    websocket.on('presence:list', (data: any) => {
      const userList = data.users as PresenceUser[]
      users.value.clear()
      userList.forEach(user => addUser(user))
    })

    // User removed
    websocket.on('presence:removed', (data: any) => {
      removeUser(data.userId)
    })

    // Connection lost - mark all as offline
    websocket.on('disconnected', () => {
      for (const [userId] of users.value) {
        markUserOffline(userId)
      }
    })
  }

  // Setup global activity tracking
  const setupActivityTracking = (): void => {
    if (typeof window === 'undefined') return

    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ]

    const handleActivity = () => {
      trackActivity()
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setAway()
      } else {
        setOnline()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup on unmount
    if (typeof onUnmounted === 'function') {
      onUnmounted(() => {
        activityEvents.forEach(event => {
          document.removeEventListener(event, handleActivity)
        })
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      })
    }
  }

  // Cleanup
  const cleanup = (): void => {
    stopHeartbeat()
    if (awayTimer) {
      clearTimeout(awayTimer)
      awayTimer = null
    }
    
    // Mark current user as offline
    if (currentUser.value) {
      websocket.send({
        type: 'presence:offline',
        data: {
          userId: currentUser.value.id,
          timestamp: Date.now()
        }
      })
    }
  }

  // Initialize
  setupEventListeners()
  setupActivityTracking()

  // Auto-cleanup
  if (typeof onUnmounted === 'function') {
    onUnmounted(cleanup)
  }

  return {
    // State
    users,
    currentUser,
    onlineUsers,
    userCount,
    isOnline,
    loading: isLoading,
    error: lastError,
    
    // Actions
    initializeUser,
    setStatus,
    setOnline,
    setAway,
    setBusy,
    setCurrentRoom,
    updateMetadata,
    
    // Utilities
    getUser,
    getUsersByStatus,
    getUsersInRoom,
    isUserOnline,
    addUser,
    removeUser,
    updateUser,
    trackActivity,
    cleanup
  }
}
