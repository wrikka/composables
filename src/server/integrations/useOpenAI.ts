import { ref, type Ref } from 'vue'

export interface UseOpenAIOptions {
  apiKey?: string
}

export interface UseOpenAIReturn {
  client: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useOpenAI(_options?: UseOpenAIOptions): UseOpenAIReturn {
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
