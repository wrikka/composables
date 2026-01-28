import { ref, computed } from 'vue'

export interface RoomConfig {
  name: string
  maxUsers?: number
  isPrivate?: boolean
  password?: string
  metadata?: Record<string, any>
}

export interface RoomUser {
  id: string
  name: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: number
  isActive: boolean
  metadata?: Record<string, any>
}

export interface RoomMessage {
  id: string
  userId: string
  userName: string
  content: string
  type: 'text' | 'system' | 'file' | 'image'
  timestamp: number
  metadata?: Record<string, any>
}

export interface RoomState {
  name: string
  users: RoomUser[]
  messages: RoomMessage[]
  isActive: boolean
  userCount: number
  messageCount: number
}

export function useSocketRoom(websocket: any, roomConfig: RoomConfig) {
  const {
    name,
    maxUsers,
    isPrivate = false,
    password,
    metadata = {}
  } = roomConfig

  const roomState = ref<RoomState>({
    name,
    users: [],
    messages: [],
    isActive: false,
    userCount: 0,
    messageCount: 0
  })

  const loading = ref(false)
  const error = ref<Error | null>(null)
  const currentUser = ref<RoomUser | null>(null)

  const isLoading = computed(() => loading.value)
  const lastError = computed(() => error.value)
  const isActive = computed(() => roomState.value.isActive)
  const users = computed(() => roomState.value.users)
  const messages = computed(() => roomState.value.messages)
  const userCount = computed(() => roomState.value.userCount)
  const messageCount = computed(() => roomState.value.messageCount)
  const isOwner = computed(() => currentUser.value?.role === 'owner')
  const isAdmin = computed(() => currentUser.value?.role === 'admin' || isOwner.value)

  // Join room
  const joinRoom = async (userData: Partial<RoomUser> = {}): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const joinData = {
        room: name,
        isPrivate,
        password,
        user: userData
      }

      websocket.send({
        type: 'room:join',
        data: joinData
      })

      return true

    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    } finally {
      loading.value = false
    }
  }

  // Leave room
  const leaveRoom = (): void => {
    websocket.send({
      type: 'room:leave',
      data: { room: name }
    })

    roomState.value.isActive = false
    currentUser.value = null
  }

  // Send message
  const sendMessage = (content: string, type: RoomMessage['type'] = 'text', metadata?: Record<string, any>): void => {
    if (!isActive.value) {
      throw new Error('Not in room')
    }

    const message: Omit<RoomMessage, 'id' | 'timestamp'> = {
      userId: currentUser.value?.id || 'anonymous',
      userName: currentUser.value?.name || 'Anonymous',
      content,
      type,
      metadata
    }

    websocket.send({
      type: 'room:message',
      data: {
        room: name,
        message
      }
    })
  }

  // Send system message
  const sendSystemMessage = (content: string, metadata?: Record<string, any>): void => {
    sendMessage(content, 'system', metadata)
  }

  // Update user role
  const updateUserRole = (userId: string, role: RoomUser['role']): void => {
    if (!isAdmin.value) {
      throw new Error('Insufficient permissions')
    }

    websocket.send({
      type: 'room:update_role',
      data: {
        room: name,
        userId,
        role
      }
    })
  }

  // Kick user
  const kickUser = (userId: string, reason?: string): void => {
    if (!isAdmin.value) {
      throw new Error('Insufficient permissions')
    }

    websocket.send({
      type: 'room:kick',
      data: {
        room: name,
        userId,
        reason
      }
    })
  }

  // Ban user
  const banUser = (userId: string, reason?: string): void => {
    if (!isOwner.value) {
      throw new Error('Only owner can ban users')
    }

    websocket.send({
      type: 'room:ban',
      data: {
        room: name,
        userId,
        reason
      }
    })
  }

  // Mute user
  const muteUser = (userId: string, duration?: number): void => {
    if (!isAdmin.value) {
      throw new Error('Insufficient permissions')
    }

    websocket.send({
      type: 'room:mute',
      data: {
        room: name,
        userId,
        duration
      }
    })
  }

  // Unmute user
  const unmuteUser = (userId: string): void => {
    if (!isAdmin.value) {
      throw new Error('Insufficient permissions')
    }

    websocket.send({
      type: 'room:unmute',
      data: {
        room: name,
        userId
      }
    })
  }

  // Get user by ID
  const getUser = (userId: string): RoomUser | undefined => {
    return users.value.find(user => user.id === userId)
  }

  // Get user by name
  const getUserByName = (userName: string): RoomUser | undefined => {
    return users.value.find(user => user.name === userName)
  }

  // Check if user is in room
  const hasUser = (userId: string): boolean => {
    return users.value.some(user => user.id === userId)
  }

  // Clear messages
  const clearMessages = (): void => {
    roomState.value.messages = []
    roomState.value.messageCount = 0
  }

  // Get room info
  const getRoomInfo = () => ({
    name: roomState.value.name,
    userCount: roomState.value.userCount,
    messageCount: roomState.value.messageCount,
    isActive: roomState.value.isActive,
    maxUsers,
    isPrivate,
    metadata
  })

  // Setup WebSocket event listeners
  const setupEventListeners = (): void => {
    // Room joined
    websocket.on('room:joined', (data: any) => {
      if (data.room === name) {
        roomState.value.isActive = true
        roomState.value.users = data.users || []
        roomState.value.userCount = data.users?.length || 0
        
        if (data.currentUser) {
          currentUser.value = data.currentUser
        }
      }
    })

    // Room left
    websocket.on('room:left', (data: any) => {
      if (data.room === name) {
        roomState.value.isActive = false
        currentUser.value = null
      }
    })

    // User joined
    websocket.on('room:user_joined', (data: any) => {
      if (data.room === name) {
        const user = data.user as RoomUser
        roomState.value.users.push(user)
        roomState.value.userCount = roomState.value.users.length
      }
    })

    // User left
    websocket.on('room:user_left', (data: any) => {
      if (data.room === name) {
        const userId = data.userId
        roomState.value.users = roomState.value.users.filter(user => user.id !== userId)
        roomState.value.userCount = roomState.value.users.length
      }
    })

    // Message received
    websocket.on('room:message', (data: any) => {
      if (data.room === name) {
        const message = data.message as RoomMessage
        roomState.value.messages.push(message)
        roomState.value.messageCount = roomState.value.messages.length
      }
    })

    // User role updated
    websocket.on('room:role_updated', (data: any) => {
      if (data.room === name) {
        const user = roomState.value.users.find(u => u.id === data.userId)
        if (user) {
          user.role = data.role
        }
        
        if (currentUser.value?.id === data.userId) {
          currentUser.value.role = data.role
        }
      }
    })

    // User kicked
    websocket.on('room:user_kicked', (data: any) => {
      if (data.room === name) {
        const userId = data.userId
        roomState.value.users = roomState.value.users.filter(user => user.id !== userId)
        roomState.value.userCount = roomState.value.users.length
        
        if (currentUser.value?.id === userId) {
          roomState.value.isActive = false
          currentUser.value = null
        }
      }
    })

    // Room state updated
    websocket.on('room:state', (data: any) => {
      if (data.room === name) {
        roomState.value = { ...roomState.value, ...data.state }
      }
    })
  }

  // Initialize
  setupEventListeners()

  return {
    // State
    isActive,
    users,
    messages,
    userCount,
    messageCount,
    currentUser,
    isOwner,
    isAdmin,
    loading: isLoading,
    error: lastError,
    
    // Actions
    joinRoom,
    leaveRoom,
    sendMessage,
    sendSystemMessage,
    updateUserRole,
    kickUser,
    banUser,
    muteUser,
    unmuteUser,
    clearMessages,
    
    // Utilities
    getUser,
    getUserByName,
    hasUser,
    getRoomInfo
  }
}
