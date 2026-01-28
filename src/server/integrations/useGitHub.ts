import { ref, type Ref } from 'vue'

export interface UseGitHubOptions {
  clientId?: string
  clientSecret?: string
}

export interface UseGitHubReturn {
  client: any
  auth: any
  repos: any
  issues: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useGitHub(_options?: UseGitHubOptions): UseGitHubReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const client = null
  const auth = null
  const repos = null
  const issues = null

  return {
    client,
    auth,
    repos,
    issues,
    isConnected,
    isLoading,
    error,
  }
}
