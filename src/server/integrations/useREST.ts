import { ref, type Ref } from 'vue'

export interface UseRESTOptions {
  baseURL?: string
}

export interface UseRESTReturn {
  client: any
  request: any
  response: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useREST(_options?: UseRESTOptions): UseRESTReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const request = null
  const response = null

  return {
    client,
    request,
    response,
    isConnected,
    isLoading,
    error,
  }
}
