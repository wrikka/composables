import { ref, watch, onUnmounted, type Ref } from 'vue'

export interface UseThrottleOptions {
  delay?: number
  leading?: boolean
  trailing?: boolean
}

export function useThrottle<T>(
  source: Ref<T> | (() => T),
  callback: (value: T) => void,
  options: UseThrottleOptions = {}
): { throttledValue: Ref<T>; flush: () => void; cancel: () => void } {
  const {
    delay = 300,
    leading = true,
    trailing = true
  } = options

  const throttledValue = ref<T>(typeof source === 'function' ? source() : source.value)
  let timeoutId: NodeJS.Timeout | null = null
  let lastCallTime = 0
  let lastInvokeTime = 0

  const invokeFunc = (value: T) => {
    callback(value)
    throttledValue.value = value
  }

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    
    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (leading && timeSinceLastInvoke >= delay)
    )
  }

  const trailingEdge = (time: number, value: T) => {
    timeoutId = null
    
    if (trailing && lastCallTime) {
      invokeFunc(value)
    }
    
    lastCallTime = 0
    lastInvokeTime = time
  }

  const leadingEdge = (time: number, value: T) => {
    lastCallTime = time
    lastInvokeTime = time
    
    if (leading) {
      invokeFunc(value)
    }
    
    timeoutId = setTimeout(() => {
      trailingEdge(Date.now(), value)
    }, delay)
  }

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - lastCallTime
    return Math.max(delay - timeSinceLastCall, 0)
  }

  const timerExpired = (value: T) => {
    const time = Date.now()
    
    if (shouldInvoke(time)) {
      trailingEdge(time, value)
    } else {
      timeoutId = setTimeout(() => {
        timerExpired(value)
      }, remainingWait(time))
    }
  }

  const clear = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    const currentValue = typeof source === 'function' ? source() : source.value
    if (lastCallTime) {
      invokeFunc(currentValue)
    }
    lastCallTime = 0
    lastInvokeTime = 0
  }

  const cancel = () => {
    clear()
    lastCallTime = 0
    lastInvokeTime = 0
  }

  const throttledFn = (value: T) => {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastCallTime = time

    if (isInvoking) {
      if (timeoutId === null) {
        leadingEdge(time, value)
      } else {
        timeoutId = setTimeout(() => {
          timerExpired(value)
        }, remainingWait(time))
      }
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        timerExpired(value)
      }, delay)
    }
  }

  if (typeof source === 'object' && 'value' in source) {
    watch(source, (newValue) => {
      throttledFn(newValue)
    }, { immediate: leading })
  }

  onUnmounted(() => {
    clear()
  })

  return {
    throttledValue: ref(throttledValue.value) as Ref<T>,
    flush,
    cancel
  }
}
