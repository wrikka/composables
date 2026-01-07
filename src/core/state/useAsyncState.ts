import { ref, computed, type Ref, ComputedRef } from 'vue'

export interface UseAsyncStateOptions<T> {
  immediate?: boolean
  resetOnExecute?: boolean
  shallow?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: T) => void
}

export interface UseAsyncStateReturn<T> {
  state: Ref<'idle' | 'pending' | 'ready' | 'error'>
  data: Ref<T | undefined>
  error: Ref<Error | undefined>
  isReady: ComputedRef<boolean>
  isPending: ComputedRef<boolean>
  isError: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  execute: () => Promise<T>
  reset: () => void
}

export function useAsyncState<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncStateOptions<T> = {}
): UseAsyncStateReturn<T> {
  const {
    immediate = true,
    resetOnExecute = false,
    shallow: _shallow = false,
    onError,
    onSuccess
  } = options

  const state = ref<'idle' | 'pending' | 'ready' | 'error'>('idle')
  const data = ref<T | undefined>(undefined) as Ref<T | undefined>
  const error = ref<Error | undefined>(undefined)

  const isReady = computed(() => state.value === 'ready')
  const isPending = computed(() => state.value === 'pending')
  const isError = computed(() => state.value === 'error')
  const isLoading = computed(() => state.value === 'pending')

  const execute = async (): Promise<T> => {
    try {
      state.value = 'pending'
      
      if (resetOnExecute) {
        data.value = undefined
        error.value = undefined
      }

      const result = await asyncFunction()
      
      data.value = result
      error.value = undefined
      state.value = 'ready'
      
      onSuccess?.(result)
      
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      
      error.value = errorObj
      data.value = undefined
      state.value = 'error'
      
      onError?.(errorObj)
      
      throw errorObj
    }
  }

  const reset = () => {
    state.value = 'idle'
    data.value = undefined
    error.value = undefined
  }

  if (immediate) {
    execute()
  }

  return {
    state,
    data,
    error,
    isReady,
    isPending,
    isError,
    isLoading,
    execute,
    reset
  }
}
