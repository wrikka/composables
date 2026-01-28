import { ref, onMounted, onUnmounted } from 'vue'

export interface BatteryChargingState {
  isCharging: boolean
  chargingTime: number | null
  dischargingTime: number | null
}

export function useBatteryCharging() {
  const isCharging = ref(false)
  const chargingTime = ref<number | null>(null)
  const dischargingTime = ref<number | null>(null)

  let battery: Battery | null = null

  const updateBatteryInfo = () => {
    if (battery) {
      isCharging.value = battery.charging
      chargingTime.value = battery.chargingTime
      dischargingTime.value = battery.dischargingTime
    }
  }

  const handleChargingChange = () => {
    isCharging.value = battery?.charging ?? false
  }

  const handleChargingTimeChange = () => {
    chargingTime.value = battery?.chargingTime ?? null
  }

  const handleDischargingTimeChange = () => {
    dischargingTime.value = battery?.dischargingTime ?? null
  }

  onMounted(async () => {
    if ('getBattery' in navigator) {
      battery = await (navigator as any).getBattery()
      updateBatteryInfo()

      battery.addEventListener('chargingchange', handleChargingChange)
      battery.addEventListener('chargingtimechange', handleChargingTimeChange)
      battery.addEventListener('dischargingtimechange', handleDischargingTimeChange)
    }
  })

  onUnmounted(() => {
    if (battery) {
      battery.removeEventListener('chargingchange', handleChargingChange)
      battery.removeEventListener('chargingtimechange', handleChargingTimeChange)
      battery.removeEventListener('dischargingtimechange', handleDischargingTimeChange)
    }
  })

  return {
    isCharging,
    chargingTime,
    dischargingTime,
  }
}
