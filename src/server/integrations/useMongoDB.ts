import { ref, type Ref } from 'vue'

export interface UseMongoDBOptions {
  connectionString?: string
}

export interface UseMongoDBReturn {
  client: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useMongoDB(_options?: UseMongoDBOptions): UseMongoDBReturn {
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
