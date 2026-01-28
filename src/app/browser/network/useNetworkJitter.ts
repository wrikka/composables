import { ref, onMounted, onUnmounted } from 'vue'

export interface NetworkJitterState {
  jitter: number | null
  jitterHistory: number[]
  averageJitter: number | null
}

export function useNetworkJitter(interval = 5000) {
  const jitter = ref<number | null>(null)
  const jitterHistory = ref<number[]>([])
  const averageJitter = ref<number | null>(null)

  let intervalId: number | null = null
  let previousLatency: number | null = null

  const measureJitter = async () => {
    const start = performance.now()
    try {
      await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store',
      })
      const end = performance.now()
      const currentLatency = end - start

      if (previousLatency !== null) {
        const currentJitter = Math.abs(currentLatency - previousLatency)
        jitter.value = currentJitter
        
        jitterHistory.value.push(currentJitter)
        if (jitterHistory.value.length > 10) {
          jitterHistory.value.shift()
        }

        averageJitter.value = jitterHistory.value.reduce((a, b) => a + b, 0) / jitterHistory.value.length
      }

      previousLatency = currentLatency
    } catch (error) {
      console.error('Failed to measure jitter:', error)
    }
  }

  onMounted(() => {
    measureJitter()
    intervalId = window.setInterval(measureJitter, interval)
  })

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return {
    jitter,
    jitterHistory,
    averageJitter,
  }
}
