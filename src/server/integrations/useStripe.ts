import { ref, type Ref } from 'vue'

export interface UseStripeOptions {
  publishableKey?: string
}

export interface UseStripeReturn {
  client: any
  elements: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useStripe(_options?: UseStripeOptions): UseStripeReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const elements = null

  return {
    client,
    elements,
    isConnected,
    isLoading,
    error,
  }
}
