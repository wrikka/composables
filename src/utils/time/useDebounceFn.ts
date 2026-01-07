import { ref } from 'vue'

export interface UseDebounceFnOptions {
  delay?: number
}

export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  options: UseDebounceFnOptions = {}
) {
  const { delay = 300 } = options

  const timeoutRef = ref<NodeJS.Timeout | null>(null)
  const isPending = ref(false)

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value)
    }

    isPending.value = true

    timeoutRef.value = setTimeout(() => {
      isPending.value = false
      timeoutRef.value = null
      fn(...args)
    }, delay)
  }

  const cancel = () => {
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value)
      timeoutRef.value = null
      isPending.value = false
    }
  }

  const flush = (...args: Parameters<T>) => {
    cancel()
    isPending.value = false
    fn(...args)
  }

  return {
    debouncedFn,
    cancel,
    flush,
    isPending
  }
}
