import { ref, type Ref } from 'vue'

export interface UseDrizzleOptions {
  connectionString?: string
}

export interface UseDrizzleReturn {
  client: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useDrizzle(_options?: UseDrizzleOptions): UseDrizzleReturn {
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
