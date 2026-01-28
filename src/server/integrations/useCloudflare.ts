import { ref, type Ref } from 'vue'

export interface UseCloudflareOptions {
  accountId?: string
  apiKey?: string
}

export interface UseCloudflareReturn {
  kv: any
  r2: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useCloudflare(_options?: UseCloudflareOptions): UseCloudflareReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const kv = null
  const r2 = null

  return {
    kv,
    r2,
    isConnected,
    isLoading,
    error,
  }
}
