import { ref, type Ref } from 'vue'

export interface UseVercelOptions {
  token?: string
}

export interface UseVercelReturn {
  client: any
  deployments: any
  edge: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useVercel(_options?: UseVercelOptions): UseVercelReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const deployments = null
  const edge = null

  return {
    client,
    deployments,
    edge,
    isConnected,
    isLoading,
    error,
  }
}
