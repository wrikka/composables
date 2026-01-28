import { ref, type Ref } from 'vue'

export interface UseDockerOptions {
  socketPath?: string
}

export interface UseDockerReturn {
  client: any
  containers: any
  images: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useDocker(_options?: UseDockerOptions): UseDockerReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const containers = null
  const images = null

  return {
    client,
    containers,
    images,
    isConnected,
    isLoading,
    error,
  }
}
