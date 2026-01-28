import { ref, type Ref } from 'vue'

export interface UseBetterAuthOptions {
  baseUrl?: string
}

export interface UseBetterAuthReturn {
  client: any
  auth: any
  session: any
  user: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useBetterAuth(_options?: UseBetterAuthOptions): UseBetterAuthReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const auth = null
  const session = null
  const user = null

  return {
    client,
    auth,
    session,
    user,
    isConnected,
    isLoading,
    error,
  }
}
