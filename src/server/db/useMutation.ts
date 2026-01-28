import { ref, readonly, type Ref } from 'vue'

export interface MutationOptions<T = any, V = any> {
  mutation: (variables: V) => Promise<T>
  variables?: V
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onSettled?: (data: T | null, error: Error | null) => void
}

export interface MutationResult<T = any> {
  data: T | null
  loading: boolean
  error: Error | null
  success: boolean
}

export function useMutation<T = any, V = any>(options: MutationOptions<T, V>) {
  const {
    mutation,
    variables,
    immediate = false,
    onSuccess,
    onError,
    onSettled
  } = options

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const success = ref(false)

  const execute = async (vars?: V): Promise<MutationResult<T>> => {
    loading.value = true
    error.value = null
    success.value = false

    try {
      const result = await mutation(vars || variables || {} as V)
      
      data.value = result
      success.value = true

      onSuccess?.(result)
      onSettled?.(result, null)

      return {
        data: result,
        loading: false,
        error: null,
        success: true
      }
    } catch (err) {
      const errorObj = err as Error
      error.value = errorObj
      success.value = false

      onError?.(errorObj)
      onSettled?.(null, errorObj)

      return {
        data: null,
        loading: false,
        error: errorObj,
        success: false
      }
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
    success.value = false
  }

  // Auto-execute if immediate
  if (immediate && variables) {
    execute(variables)
  }

  return {
    data: readonly(data) as Ref<T | null>,
    loading: readonly(loading) as Ref<boolean>,
    error: readonly(error) as Ref<Error | null>,
    success: readonly(success) as Ref<boolean>,
    execute,
    reset
  }
}
