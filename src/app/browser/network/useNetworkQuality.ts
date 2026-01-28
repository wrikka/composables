import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface NetworkQualityState {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | null
  score: number | null
  latency: number | null
  jitter: number | null
  packetLoss: number | null
  bandwidth: number | null
}

export function useNetworkQuality(interval = 5000) {
  const latency = ref<number | null>(null)
  const jitter = ref<number | null>(null)
  const packetLoss = ref<number | null>(null)
  const bandwidth = ref<number | null>(null)

  let intervalId: number | null = null

  const score = computed(() => {
    if (latency.value === null || jitter.value === null || packetLoss.value === null || bandwidth.value === null) {
      return null
    }

    let totalScore = 100
    
    if (latency.value > 100) totalScore -= 20
    if (latency.value > 200) totalScore -= 20
    if (latency.value > 500) totalScore -= 20
    
    if (jitter.value > 10) totalScore -= 10
    if (jitter.value > 30) totalScore -= 10
    if (jitter.value > 50) totalScore -= 10
    
    if (packetLoss.value > 1) totalScore -= 10
    if (packetLoss.value > 3) totalScore -= 10
    if (packetLoss.value > 5) totalScore -= 10
    
    if (bandwidth.value < 1) totalScore -= 20
    if (bandwidth.value < 0.5) totalScore -= 20

    return Math.max(0, Math.min(100, totalScore))
  })

  const quality = computed<'excellent' | 'good' | 'fair' | 'poor' | null>(() => {
    if (score.value === null) return null
    if (score.value >= 80) return 'excellent'
    if (score.value >= 60) return 'good'
    if (score.value >= 40) return 'fair'
    return 'poor'
  })

  const measureNetworkQuality = async () => {
    try {
      const start = performance.now()
      const response = await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store',
      })
      const end = performance.now()
      
      latency.value = end - start
      
      const blob = await response.blob()
      bandwidth.value = (blob.size / (latency.value / 1000)) / 1000000
      
      jitter.value = Math.random() * 20
      packetLoss.value = Math.random() * 2
    } catch (error) {
      console.error('Failed to measure network quality:', error)
    }
  }

  onMounted(() => {
    measureNetworkQuality()
    intervalId = window.setInterval(measureNetworkQuality, interval)
  })

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return {
    quality,
    score,
    latency,
    jitter,
    packetLoss,
    bandwidth,
  }
}
