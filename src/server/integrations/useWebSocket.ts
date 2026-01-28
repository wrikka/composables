import { ref, type Ref } from 'vue'

export interface UseWebSocketOptions {
  url?: string
}

export interface UseWebSocketReturn {
  client: any
  connection: any
  messages: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useWebSocket(_options?: UseWebSocketOptions): UseWebSocketReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const connection = null
  const messages = null

  return {
    client,
    connection,
    messages,
    isConnected,
    isLoading,
    error,
  }
}
