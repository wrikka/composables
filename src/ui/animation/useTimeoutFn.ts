import { ref, onUnmounted, type Ref } from 'vue'

export interface UseTimeoutFnOptions {
  immediate?: boolean
}

export interface UseTimeoutFnReturn {
  isPending: Ref<boolean>
  start: (...args: any[]) => void
  stop: () => void
}

export function useTimeoutFn(
  callback: (...args: any[]) => any,
  delay: number,
  options: UseTimeoutFnOptions = {}
) {
  const { immediate = false } = options
  
  const isPending = ref(false)
  let timeoutId: NodeJS.Timeout | null = null

  const clear = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    isPending.value = false
  }

  const start = (...args: any[]) => {
    clear()
    isPending.value = true
    
    timeoutId = setTimeout(() => {
      isPending.value = false
      timeoutId = null
      callback(...args)
    }, delay)
  }

  const stop = () => {
    clear()
  }

  if (immediate) {
    start()
  }

  onUnmounted(() => {
    clear()
  })

  return {
    isPending,
    start,
    stop
  }
}
