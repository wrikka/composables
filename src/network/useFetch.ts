import { ref, unref, watchEffect } from 'vue'

interface UseFetchOptions {
  immediate?: boolean
}

export function useFetch(url: string, options: UseFetchOptions = {}) {
  const data = ref(null)
  const error = ref<Error | null>(null)
  const isFetching = ref(false)

  const { immediate = true } = options

  const execute = async () => {
    isFetching.value = true
    error.value = null
    try {
      const res = await fetch(unref(url))
      if (!res.ok) {
        throw new Error(res.statusText)
      }
      data.value = await res.json()
    } catch (e: any) {
      error.value = e
    } finally {
      isFetching.value = false
    }
  }

  if (immediate) {
    watchEffect(execute)
  }

  return { data, error, isFetching, execute }
}
