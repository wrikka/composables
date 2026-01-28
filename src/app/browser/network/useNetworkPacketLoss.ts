import { ref, onMounted, onUnmounted } from 'vue'

export interface NetworkPacketLossState {
  packetLoss: number | null
  packetLossHistory: number[]
  averagePacketLoss: number | null
}

export function useNetworkPacketLoss(interval = 5000) {
  const packetLoss = ref<number | null>(null)
  const packetLossHistory = ref<number[]>([])
  const averagePacketLoss = ref<number | null>(null)

  let intervalId: number | null = null
  let totalPackets = 0
  let lostPackets = 0

  const measurePacketLoss = async () => {
    try {
      const start = performance.now()
      await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store',
      })
      const end = performance.now()
      const latency = end - start

      totalPackets++
      
      if (latency > 1000) {
        lostPackets++
      }

      const currentPacketLoss = totalPackets > 0 ? (lostPackets / totalPackets) * 100 : 0
      packetLoss.value = currentPacketLoss
      
      packetLossHistory.value.push(currentPacketLoss)
      if (packetLossHistory.value.length > 10) {
        packetLossHistory.value.shift()
      }

      averagePacketLoss.value = packetLossHistory.value.reduce((a, b) => a + b, 0) / packetLossHistory.value.length
    } catch (error) {
      totalPackets++
      lostPackets++
      console.error('Failed to measure packet loss:', error)
    }
  }

  onMounted(() => {
    measurePacketLoss()
    intervalId = window.setInterval(measurePacketLoss, interval)
  })

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return {
    packetLoss,
    packetLossHistory,
    averagePacketLoss,
  }
}
