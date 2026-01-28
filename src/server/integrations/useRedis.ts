import { ref, type Ref } from 'vue'

export interface UseRedisOptions {
  connectionString?: string
}

export interface UseRedisReturn {
  client: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useRedis(_options?: UseRedisOptions): UseRedisReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null

  return {
    client,
    isConnected,
    isLoading,
    error,
  }
}
