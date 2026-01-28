import { ref } from 'vue'

export interface WebAssemblyState {
  load: (url: string) => Promise<WebAssembly.Instance | null>
  instance: WebAssembly.Instance | null
  isLoading: boolean
  error: Error | null
}

export function useWebAssembly() {
  const instance = ref<WebAssembly.Instance | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const load = async (url: string): Promise<WebAssembly.Instance | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(url)
      const buffer = await response.arrayBuffer()
      const module = await WebAssembly.compile(buffer)
      instance.value = await WebAssembly.instantiate(module)
      return instance.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    load,
    instance,
    isLoading,
    error,
  }
}
