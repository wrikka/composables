import { ref, onMounted, onUnmounted } from 'vue'

export interface NetworkLatencyState {
  latency: number | null
  rtt: number | null
  ping: number | null
}

export function useNetworkLatency() {
  const latency = ref<number | null>(null)
  const rtt = ref<number | null>(null)
  const ping = ref<number | null>(null)

  let intervalId: number | null = null

  const measureLatency = async () => {
    const start = performance.now()
    try {
      await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store',
      })
      const end = performance.now()
      const measuredLatency = end - start
      
      latency.value = measuredLatency
      rtt.value = measuredLatency * 2
      ping.value = measuredLatency
    } catch (error) {
      console.error('Failed to measure latency:', error)
    }
  }

  onMounted(() => {
    measureLatency()
    intervalId = window.setInterval(measureLatency, 5000)
  })

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return {
    latency,
    rtt,
    ping,
  }
}
