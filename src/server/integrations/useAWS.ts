import { ref, type Ref } from 'vue'

export interface UseAWSOptions {
  accessKeyId?: string
  secretAccessKey?: string
  region?: string
}

export interface UseAWSReturn {
  s3: any
  lambda: any
  isConnected: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useAWS(_options?: UseAWSOptions): UseAWSReturn {
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const s3 = null
  const lambda = null

  return {
    s3,
    lambda,
    isConnected,
    isLoading,
    error,
  }
}
