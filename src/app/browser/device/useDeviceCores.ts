import { ref, onMounted } from 'vue'

export interface DeviceCoresState {
  cores: number | null
  hardwareConcurrency: number | null
}

export function useDeviceCores() {
  const cores = ref<number | null>(null)
  const hardwareConcurrency = ref<number | null>(null)

  const updateCoresInfo = () => {
    if ('hardwareConcurrency' in navigator) {
      hardwareConcurrency.value = navigator.hardwareConcurrency
      cores.value = navigator.hardwareConcurrency
    }
  }

  onMounted(() => {
    updateCoresInfo()
  })

  return {
    cores,
    hardwareConcurrency,
  }
}
