import { ref, onUnmounted, type Ref } from 'vue'

export interface UseIntervalFnOptions {
  immediate?: boolean
  immediateCallback?: boolean
}

export interface UseIntervalFnReturn {
  isActive: Ref<boolean>
  intervalId: Ref<NodeJS.Timeout | null>
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
}

export function useIntervalFn(
  callback: (...args: any[]) => any,
  interval: number,
  options: UseIntervalFnOptions = {}
) {
  const { immediate = false, immediateCallback = false } = options
  
  const isActive = ref(false)
  const intervalId = ref<NodeJS.Timeout | null>(null)

  const clear = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
    isActive.value = false
  }

  const start = () => {
    if (intervalId.value) return
    
    clear()
    isActive.value = true
    
    if (immediateCallback) {
      callback()
    }
    
    intervalId.value = setInterval(callback, interval) as unknown as NodeJS.Timeout
  }

  const stop = () => {
    clear()
  }

  const pause = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
    isActive.value = false
  }

  const resume = () => {
    if (!isActive.value) return
    start()
  }

  if (immediate) {
    start()
  }

  onUnmounted(() => {
    clear()
  })

  return {
    isActive,
    intervalId,
    start,
    stop,
    pause,
    resume
  }
}
