import { ref, type Ref } from 'vue'

export interface UseWebRTCOptions {
  stunServers?: string[]
}

export interface UseWebRTCReturn {
  client: any
  stream: any
  call: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useWebRTC(_options?: UseWebRTCOptions): UseWebRTCReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const stream = null
  const call = null

  return {
    client,
    stream,
    call,
    isConnected,
    isLoading,
    error,
  }
}
