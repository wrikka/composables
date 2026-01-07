import { ref, onMounted, onUnmounted } from 'vue'

export interface UseNowOptions {
  interval?: number
  immediate?: boolean
}

export function useNow(options: UseNowOptions = {}) {
  const { interval = 1000, immediate = true } = options
  
  const now = ref(new Date())
  const isActive = ref(false)
  let intervalId: NodeJS.Timeout | null = null

  const start = () => {
    if (intervalId) return
    
    isActive.value = true
    now.value = new Date()
    
    intervalId = setInterval(() => {
      now.value = new Date()
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
    start()
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
    now,
    isActive,
    start,
    stop,
    pause,
    resume
  }
}
