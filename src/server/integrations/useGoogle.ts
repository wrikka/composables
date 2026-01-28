import { ref, type Ref } from 'vue'

export interface UseGoogleOptions {
  clientId?: string
  apiKey?: string
}

export interface UseGoogleReturn {
  client: any
  auth: any
  maps: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useGoogle(_options?: UseGoogleOptions): UseGoogleReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const auth = null
  const maps = null

  return {
    client,
    auth,
    maps,
    isConnected,
    isLoading,
    error,
  }
}
