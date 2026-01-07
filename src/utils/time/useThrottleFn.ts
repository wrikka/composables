import { ref } from 'vue'

export interface UseThrottleFnOptions {
  delay?: number
  leading?: boolean
  trailing?: boolean
}

export function useThrottleFn<T extends (...args: any[]) => any>(
  fn: T,
  options: UseThrottleFnOptions = {}
) {
  const { delay = 300, leading = true, trailing = true } = options

  const timeoutRef = ref<NodeJS.Timeout | null>(null)
  const lastCallTime = ref(0)
  const isPending = ref(false)

  const throttledFn = (...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime.value

    if (timeSinceLastCall >= delay) {
      if (leading) {
        lastCallTime.value = now
        fn(...args)
      }
    } else {
      if (timeoutRef.value) {
        clearTimeout(timeoutRef.value)
      }

      isPending.value = true

      if (trailing) {
        timeoutRef.value = setTimeout(() => {
          lastCallTime.value = Date.now()
          isPending.value = false
          timeoutRef.value = null
          fn(...args)
        }, delay - timeSinceLastCall)
      }
    }
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
    lastCallTime.value = Date.now()
    fn(...args)
  }

  return {
    throttledFn,
    cancel,
    flush,
    isPending
  }
}
