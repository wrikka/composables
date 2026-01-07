import { ref, watch, onUnmounted, type Ref } from 'vue'

export interface UseDebounceOptions {
  delay?: number
  immediate?: boolean
  onLeading?: boolean
  onTrailing?: boolean
  maxWait?: number
}

export function useDebounce<T>(
  source: Ref<T> | (() => T),
  callback: (value: T) => void,
  options: UseDebounceOptions = {}
): { debouncedValue: Ref<T>; flush: () => void; cancel: () => void } {
  const {
    delay = 300,
    immediate = false,
    onLeading = false,
    onTrailing = true,
    maxWait
  } = options

  const debouncedValue = ref<T>(typeof source === 'function' ? source() : source.value)
  let timeoutId: NodeJS.Timeout | null = null
  let maxTimeoutId: NodeJS.Timeout | null = null
  let lastCallTime = 0

  const invokeFunc = (value: T) => {
    callback(value)
    debouncedValue.value = value
  }

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime
    const timeWaiting = delay - timeSinceLastCall
    
    return (
      timeSinceLastCall === 0 ||
      timeSinceLastCall >= delay ||
      (maxWait && timeWaiting <= 0)
    )
  }

  const trailingEdge = (_time: number, value: T) => {
    timeoutId = null
    
    if (onTrailing) {
      invokeFunc(value)
    }
  }

  const leadingEdge = (time: number, value: T) => {
    lastCallTime = time
    
    if (onLeading) {
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

  const maxWaitExpired = (value: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    maxTimeoutId = null
    invokeFunc(value)
  }

  const clear = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId)
      maxTimeoutId = null
    }
  }

  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId)
      maxTimeoutId = null
    }
    const currentValue = typeof source === 'function' ? source() : source.value
    invokeFunc(currentValue)
  }

  const cancel = () => {
    clear()
    lastCallTime = 0
  }

  const debouncedFn = (value: T) => {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    clear()
    
    if (isInvoking) {
      if (timeoutId === null) {
        leadingEdge(time, value)
      } else if (onTrailing) {
        timeoutId = setTimeout(() => {
          trailingEdge(Date.now(), value)
        }, delay)
      }
    } else {
      timeoutId = setTimeout(() => {
        timerExpired(value)
      }, remainingWait(time))
    }

    if (maxWait && !maxTimeoutId) {
      maxTimeoutId = setTimeout(() => {
        maxWaitExpired(value)
      }, maxWait)
    }
  }

  if (typeof source === 'object' && 'value' in source) {
    watch(source, (newValue) => {
      debouncedFn(newValue)
    }, { immediate })
  }

  onUnmounted(() => {
    clear()
  })

  return {
    debouncedValue: debouncedValue as Ref<T>,
    flush,
    cancel
  }
}
