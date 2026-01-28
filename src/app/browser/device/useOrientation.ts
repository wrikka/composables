import { ref, onMounted, onUnmounted } from 'vue'

export interface OrientationState {
  alpha: number | null
  beta: number | null
  gamma: number | null
  absolute: boolean
}

export function useOrientation() {
  const alpha = ref<number | null>(null)
  const beta = ref<number | null>(null)
  const gamma = ref<number | null>(null)
  const absolute = ref(false)

  const handleOrientation = (event: DeviceOrientationEvent) => {
    alpha.value = event.alpha
    beta.value = event.beta
    gamma.value = event.gamma
    absolute.value = event.absolute ?? false
  }

  const start = () => {
    window.addEventListener('deviceorientation', handleOrientation)
  }

  const stop = () => {
    window.removeEventListener('deviceorientation', handleOrientation)
  }

  onMounted(() => {
    start()
  })

  onUnmounted(() => {
    stop()
  })

  return {
    alpha,
    beta,
    gamma,
    absolute,
    start,
    stop,
  }
}
