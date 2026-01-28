import { ref, type Ref } from 'vue'

export interface UseClerkOptions {
  publishableKey?: string
}

export interface UseClerkReturn {
  client: any
  auth: any
  user: any
  session: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useClerk(_options?: UseClerkOptions): UseClerkReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const auth = null
  const user = null
  const session = null

  return {
    client,
    auth,
    user,
    session,
    isConnected,
    isLoading,
    error,
  }
}
