import { ref, onMounted, onUnmounted } from 'vue'

export interface DevicePressureState {
  cpuPressure: number | null
  memoryPressure: number | null
  overallPressure: number | null
}

export function useDevicePressure() {
  const cpuPressure = ref<number | null>(null)
  const memoryPressure = ref<number | null>(null)
  const overallPressure = ref<number | null>(null)

  let pressureObserver: any = null

  const updatePressureInfo = () => {
    if (pressureObserver) {
      cpuPressure.value = pressureObserver.cpuPressure ?? null
      memoryPressure.value = pressureObserver.memoryPressure ?? null
      overallPressure.value = pressureObserver.overallPressure ?? null
    }
  }

  const handlePressureChange = () => {
    updatePressureInfo()
  }

  onMounted(async () => {
    if ('pressure' in navigator) {
      pressureObserver = await (navigator as any).pressure.getPressureStatus()
      updatePressureInfo()

      pressureObserver.addEventListener('pressurechange', handlePressureChange)
    }
  })

  onUnmounted(() => {
    if (pressureObserver) {
      pressureObserver.removeEventListener('pressurechange', handlePressureChange)
    }
  })

  return {
    cpuPressure,
    memoryPressure,
    overallPressure,
  }
}
