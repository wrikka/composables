import { ref, type Ref } from 'vue'

export interface UseFirebaseOptions {
  apiKey?: string
  authDomain?: string
  projectId?: string
}

export interface UseFirebaseReturn {
  app: any
  auth: any
  database: any
  storage: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useFirebase(_options?: UseFirebaseOptions): UseFirebaseReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const app = null
  const auth = null
  const database = null
  const storage = null

  return {
    app,
    auth,
    database,
    storage,
    isConnected,
    isLoading,
    error,
  }
}
