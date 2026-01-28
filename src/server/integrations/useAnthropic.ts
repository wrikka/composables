import { ref, type Ref } from 'vue'

export interface UseAnthropicOptions {
  apiKey?: string
}

export interface UseAnthropicReturn {
  client: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useAnthropic(_options?: UseAnthropicOptions): UseAnthropicReturn {
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
