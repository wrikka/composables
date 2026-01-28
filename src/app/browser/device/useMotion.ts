import { ref, onMounted, onUnmounted } from 'vue'

export interface MotionState {
  acceleration: { x: number | null; y: number | null; z: number | null }
  rotationRate: { alpha: number | null; beta: number | null; gamma: number | null }
  interval: number
}

export function useMotion() {
  const acceleration = ref({ x: null as number | null, y: null as number | null, z: null as number | null })
  const rotationRate = ref({ alpha: null as number | null, beta: null as number | null, gamma: null as number | null })
  const interval = ref(0)

  const handleMotion = (event: DeviceMotionEvent) => {
    acceleration.value.x = event.acceleration?.x ?? null
    acceleration.value.y = event.acceleration?.y ?? null
    acceleration.value.z = event.acceleration?.z ?? null
    rotationRate.value.alpha = event.rotationRate?.alpha ?? null
    rotationRate.value.beta = event.rotationRate?.beta ?? null
    rotationRate.value.gamma = event.rotationRate?.gamma ?? null
    interval.value = event.interval
  }

  const start = () => {
    window.addEventListener('devicemotion', handleMotion)
  }

  const stop = () => {
    window.removeEventListener('devicemotion', handleMotion)
  }

  onMounted(() => {
    start()
  })

  onUnmounted(() => {
    stop()
  })

  return {
    acceleration,
    rotationRate,
    interval,
    start,
    stop,
  }
}
