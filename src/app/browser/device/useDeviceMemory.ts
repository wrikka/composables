import { ref, onMounted } from 'vue'

export interface DeviceMemoryState {
  memory: number | null
  jsHeapSizeLimit: number | null
  totalJSHeapSize: number | null
  usedJSHeapSize: number | null
}

export function useDeviceMemory() {
  const memory = ref<number | null>(null)
  const jsHeapSizeLimit = ref<number | null>(null)
  const totalJSHeapSize = ref<number | null>(null)
  const usedJSHeapSize = ref<number | null>(null)

  const updateMemoryInfo = () => {
    if ('memory' in performance) {
      const perfMemory = (performance as any).memory
      memory.value = navigator.deviceMemory ?? null
      jsHeapSizeLimit.value = perfMemory?.jsHeapSizeLimit ?? null
      totalJSHeapSize.value = perfMemory?.totalJSHeapSize ?? null
      usedJSHeapSize.value = perfMemory?.usedJSHeapSize ?? null
    }
  }

  onMounted(() => {
    updateMemoryInfo()
  })

  return {
    memory,
    jsHeapSizeLimit,
    totalJSHeapSize,
    usedJSHeapSize,
  }
}
