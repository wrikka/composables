import { ref, onMounted, onUnmounted } from 'vue'

export interface DeviceThermalState {
  temperature: number | null
  overheated: boolean
}

export function useDeviceThermal() {
  const temperature = ref<number | null>(null)
  const overheated = ref(false)

  let thermalMonitor: any = null

  const updateThermalInfo = () => {
    if (thermalMonitor) {
      temperature.value = thermalMonitor.temperature ?? null
      overheated.value = thermalMonitor.overheated ?? false
    }
  }

  const handleThermalChange = () => {
    updateThermalInfo()
  }

  onMounted(async () => {
    if ('thermal' in navigator) {
      thermalMonitor = await (navigator as any).thermal.getThermalStatus()
      updateThermalInfo()

      thermalMonitor.addEventListener('thermalchange', handleThermalChange)
    }
  })

  onUnmounted(() => {
    if (thermalMonitor) {
      thermalMonitor.removeEventListener('thermalchange', handleThermalChange)
    }
  })

  return {
    temperature,
    overheated,
  }
}
