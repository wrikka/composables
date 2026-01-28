import { ref } from 'vue'

export interface WebGPUState {
  init: () => Promise<GPUDevice | null>
  device: GPUDevice | null
  adapter: GPUAdapter | null
  isInitializing: boolean
  error: Error | null
}

export function useWebGPU() {
  const device = ref<GPUDevice | null>(null)
  const adapter = ref<GPUAdapter | null>(null)
  const isInitializing = ref(false)
  const error = ref<Error | null>(null)

  const init = async (): Promise<GPUDevice | null> => {
    isInitializing.value = true
    error.value = null

    try {
      if (!navigator.gpu) {
        throw new Error('WebGPU not supported')
      }

      adapter.value = await navigator.gpu.requestAdapter()
      if (!adapter.value) {
        throw new Error('No GPU adapter found')
      }

      device.value = await adapter.value.requestDevice()
      return device.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isInitializing.value = false
    }
  }

  return {
    init,
    device,
    adapter,
    isInitializing,
    error,
  }
}
