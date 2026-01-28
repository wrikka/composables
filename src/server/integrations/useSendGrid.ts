import { ref, type Ref } from 'vue'

export interface UseSendGridOptions {
  apiKey?: string
}

export interface UseSendGridReturn {
  client: any
  email: any
  templates: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useSendGrid(_options?: UseSendGridOptions): UseSendGridReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const email = null
  const templates = null

  return {
    client,
    email,
    templates,
    isConnected,
    isLoading,
    error,
  }
}
