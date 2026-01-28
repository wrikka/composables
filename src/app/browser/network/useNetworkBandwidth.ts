import { ref, onMounted, onUnmounted } from 'vue'

export interface NetworkBandwidthState {
  bandwidth: number | null
  bandwidthHistory: number[]
  averageBandwidth: number | null
  unit: 'Mbps' | 'Kbps'
}

export function useNetworkBandwidth(interval = 5000) {
  const bandwidth = ref<number | null>(null)
  const bandwidthHistory = ref<number[]>([])
  const averageBandwidth = ref<number | null>(null)
  const unit = ref<'Mbps' | 'Kbps'>('Mbps')

  let intervalId: number | null = null
  let previousBytes = 0
  let previousTime = 0

  const measureBandwidth = async () => {
    try {
      const start = performance.now()
      const response = await fetch('https://www.google.com/favicon.ico', { 
        method: 'GET',
        cache: 'no-store',
      })
      const end = performance.now()
      
      const blob = await response.blob()
      const bytes = blob.size
      const time = (end - start) / 1000
      
      if (previousTime > 0) {
        const bandwidthMbps = ((bytes - previousBytes) / (time - previousTime)) / 1000000
        
        if (bandwidthMbps < 1) {
          bandwidth.value = bandwidthMbps * 1000
          unit.value = 'Kbps'
        } else {
          bandwidth.value = bandwidthMbps
          unit.value = 'Mbps'
        }
        
        bandwidthHistory.value.push(bandwidth.value)
        if (bandwidthHistory.value.length > 10) {
          bandwidthHistory.value.shift()
        }

        averageBandwidth.value = bandwidthHistory.value.reduce((a, b) => a + b, 0) / bandwidthHistory.value.length
      }

      previousBytes = bytes
      previousTime = time
    } catch (error) {
      console.error('Failed to measure bandwidth:', error)
    }
  }

  onMounted(() => {
    measureBandwidth()
    intervalId = window.setInterval(measureBandwidth, interval)
  })

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return {
    bandwidth,
    bandwidthHistory,
    averageBandwidth,
    unit,
  }
}
