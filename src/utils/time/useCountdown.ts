import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface UseCountdownOptions {
  interval?: number
  onComplete?: () => void
  onTick?: (remaining: number) => void
  immediate?: boolean
}

export function useCountdown(
  seconds: number,
  options: UseCountdownOptions = {}
) {
  const {
    interval = 1000,
    onComplete,
    onTick,
    immediate = true
  } = options

  const remaining = ref(seconds)
  const isActive = ref(false)
  const isCompleted = ref(false)
  let intervalId: NodeJS.Timeout | null = null

  const isExpired = computed(() => remaining.value <= 0)
  const progress = computed(() => {
    if (seconds === 0) return 1
    return Math.max(0, (seconds - remaining.value) / seconds)
  })
  const percentage = computed(() => Math.round(progress.value * 100))

  const start = () => {
    if (intervalId || isCompleted.value) return
    
    isActive.value = true
    isCompleted.value = false
    
    if (remaining.value <= 0) {
      remaining.value = seconds
    }
    
    intervalId = setInterval(() => {
      if (remaining.value > 0) {
        remaining.value--
        onTick?.(remaining.value)
      } else {
        stop()
        isCompleted.value = true
        onComplete?.()
      }
    }, interval)
  }

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isActive.value = false
  }

  const pause = () => {
    stop()
  }

  const resume = () => {
    if (!isCompleted.value) {
      start()
    }
  }

  const reset = (newSeconds?: number) => {
    stop()
    remaining.value = newSeconds !== undefined ? newSeconds : seconds
    isCompleted.value = false
  }

  const restart = () => {
    reset()
    start()
  }

  onMounted(() => {
    if (immediate && seconds > 0) {
      start()
    }
  })

  onUnmounted(() => {
    stop()
  })

  return {
    remaining,
    isActive,
    isCompleted,
    isExpired,
    progress,
    percentage,
    start,
    stop,
    pause,
    resume,
    reset,
    restart
  }
}
