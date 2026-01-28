import { ref, type Ref } from 'vue'

export interface UsePrismaOptions {
  connectionString?: string
}

export interface UsePrismaReturn {
  client: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function usePrisma(_options?: UsePrismaOptions): UsePrismaReturn {
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
