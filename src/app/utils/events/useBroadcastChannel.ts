import { ref, computed, onUnmounted, readonly, type Ref } from 'vue'

export interface BroadcastChannelMessage {
  type: string
  data: any
  timestamp?: number
  id?: string
}

export interface BroadcastChannelOptions {
  channelName: string
  enableHistory?: boolean
  maxHistory?: number
}

export function useBroadcastChannel(options: BroadcastChannelOptions) {
  const {
    channelName,
    enableHistory = false,
    maxHistory = 50
  } = options

  const messages = ref<BroadcastChannelMessage[]>([])
  const isConnected = ref(false)
  const error = ref<Error | null>(null)
  
  let channel: BroadcastChannel | null = null

  const messageCount = computed(() => messages.value.length)
  const lastMessage = computed(() => messages.value[messages.value.length - 1] || null)

  const connect = () => {
    try {
      if (typeof BroadcastChannel === 'undefined') {
        throw new Error('BroadcastChannel is not supported in this environment')
      }

      channel = new BroadcastChannel(channelName)
      isConnected.value = true
      error.value = null

      channel.onmessage = (event) => {
        const message: BroadcastChannelMessage = {
          ...event.data,
          timestamp: Date.now()
        }

        if (enableHistory) {
          messages.value.push(message)
          
          if (messages.value.length > maxHistory) {
            messages.value.shift()
          }
        }

        // Emit custom event for reactive updates
        window.dispatchEvent(new CustomEvent('broadcast-message', { detail: message }))
      }

      channel.onmessageerror = (event) => {
        error.value = new Error('Message error in broadcast channel')
        console.error('Broadcast message error:', event)
      }

    } catch (err) {
      error.value = err as Error
      isConnected.value = false
    }
  }

  const disconnect = () => {
    if (channel) {
      channel.close()
      channel = null
      isConnected.value = false
    }
  }

  const broadcast = (type: string, data: any) => {
    if (!channel || !isConnected.value) {
      throw new Error('Broadcast channel is not connected')
    }

    const message: BroadcastChannelMessage = {
      type,
      data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    }

    try {
      channel.postMessage(message)
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const clear = () => {
    messages.value = []
  }

  const getMessages = (type?: string) => {
    if (!type) return messages.value
    return messages.value.filter(msg => msg.type === type)
  }

  // Auto-connect on mount
  connect()

  // Auto-cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    messages: readonly(messages) as Ref<ReadonlyArray<BroadcastChannelMessage>>,
    isConnected: readonly(isConnected) as Ref<boolean>,
    error: readonly(error) as Ref<Error | null>,
    messageCount,
    lastMessage,
    connect,
    disconnect,
    broadcast,
    clear,
    getMessages
  }
}
