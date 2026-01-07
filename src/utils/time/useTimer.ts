import { ref, onMounted, onUnmounted } from 'vue'

export interface UseTimerOptions {
  interval?: number
  immediate?: boolean
  callback?: () => void
}

export function useTimer(options: UseTimerOptions = {}) {
  const { interval = 1000, immediate = false, callback } = options

  const time = ref(0)
  const isActive = ref(false)
  const isPaused = ref(false)

  let timerId: NodeJS.Timeout | null = null
  let startTime: number | null = null
  let pausedTime = 0

  const start = () => {
    if (isActive.value) return

    isActive.value = true
    isPaused.value = false
    startTime = Date.now() - pausedTime

    timerId = setInterval(() => {
      time.value = Date.now() - (startTime || 0)
      callback?.()
    }, interval)
  }

  const pause = () => {
    if (!isActive.value || isPaused.value) return

    isPaused.value = true
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
    pausedTime = time.value
  }

  const resume = () => {
    if (!isActive.value || !isPaused.value) return

    isPaused.value = false
    startTime = Date.now() - pausedTime

    timerId = setInterval(() => {
      time.value = Date.now() - (startTime || 0)
      callback?.()
    }, interval)
  }

  const stop = () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
    isActive.value = false
    isPaused.value = false
    time.value = 0
    startTime = null
    pausedTime = 0
  }

  const reset = () => {
    const wasActive = isActive.value
    stop()
    if (wasActive) {
      start()
    }
  }

  const setTime = (newTime: number) => {
    time.value = newTime
    if (isActive.value && !isPaused.value) {
      startTime = Date.now() - newTime
    } else {
      pausedTime = newTime
    }
  }

  const getFormattedTime = (format: 'seconds' | 'minutes:seconds' | 'hours:minutes:seconds' = 'seconds') => {
    const totalSeconds = Math.floor(time.value / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    switch (format) {
      case 'seconds':
        return totalSeconds.toString()
      case 'minutes:seconds':
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      case 'hours:minutes:seconds':
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      default:
        return totalSeconds.toString()
    }
  }

  onMounted(() => {
    if (immediate) {
      start()
    }
  })

  onUnmounted(() => {
    stop()
  })

  return {
    time,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    setTime,
    getFormattedTime
  }
}

// Countdown timer
export interface UseCountdownOptions {
  duration: number
  interval?: number
  immediate?: boolean
  onComplete?: () => void
  onTick?: (remaining: number) => void
}

export function useCountdown(options: UseCountdownOptions) {
  const { duration, interval = 1000, immediate = false, onComplete, onTick } = options

  const remaining = ref(duration)
  const isActive = ref(false)
  const isExpired = ref(false)

  let timerId: NodeJS.Timeout | null = null

  const start = () => {
    if (isActive.value || isExpired.value) return

    isActive.value = true
    isExpired.value = false

    timerId = setInterval(() => {
      remaining.value -= interval

      if (remaining.value <= 0) {
        remaining.value = 0
        stop()
        isExpired.value = true
        onComplete?.()
      } else {
        onTick?.(remaining.value)
      }
    }, interval)
  }

  const pause = () => {
    if (!isActive.value) return

    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
    isActive.value = false
  }

  const resume = () => {
    if (isActive.value || isExpired.value) return

    start()
  }

  const stop = () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
    isActive.value = false
  }

  const reset = () => {
    stop()
    remaining.value = duration
    isExpired.value = false
  }

  const addTime = (amount: number) => {
    remaining.value += amount
    if (remaining.value > duration) {
      remaining.value = duration
    }
    if (isExpired.value) {
      isExpired.value = false
    }
  }

  const subtractTime = (amount: number) => {
    remaining.value -= amount
    if (remaining.value <= 0) {
      remaining.value = 0
      if (!isExpired.value) {
        stop()
        isExpired.value = true
        onComplete?.()
      }
    }
  }

  const getFormattedTime = (format: 'seconds' | 'minutes:seconds' | 'hours:minutes:seconds' = 'seconds') => {
    const totalSeconds = Math.ceil(remaining.value / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    switch (format) {
      case 'seconds':
        return totalSeconds.toString()
      case 'minutes:seconds':
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      case 'hours:minutes:seconds':
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      default:
        return totalSeconds.toString()
    }
  }

  onMounted(() => {
    if (immediate) {
      start()
    }
  })

  onUnmounted(() => {
    stop()
  })

  return {
    remaining,
    isActive,
    isExpired,
    start,
    pause,
    resume,
    stop,
    reset,
    addTime,
    subtractTime,
    getFormattedTime
  }
}
