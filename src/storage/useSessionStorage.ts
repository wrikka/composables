import { ref, watch, type Ref } from 'vue'
import type { UseStorageReturn } from './types'

export interface UseSessionStorageOptions<T> {
  serializer?: {
    read: (value: string) => T
    write: (value: T) => string
  }
  onError?: (error: Error) => void
}

export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: UseSessionStorageOptions<T> = {}
): UseStorageReturn<T> {
  const { 
    serializer = { read: (v: string) => JSON.parse(v), write: (v: T) => JSON.stringify(v) },
    onError = (e: Error) => console.error(e)
  } = options

  const storedValue = ref(initialValue) as Ref<T>

  function read() {
    try {
      const rawValue = sessionStorage.getItem(key)
      if (rawValue !== null) {
        storedValue.value = serializer.read(rawValue)
      }
    } catch (e) {
      onError(e as Error)
    }
  }

  read()

  watch(storedValue, (newValue) => {
    try {
      sessionStorage.setItem(key, serializer.write(newValue))
    } catch (e) {
      onError(e as Error)
    }
  }, { deep: true })

  const remove = () => {
    try {
      sessionStorage.removeItem(key)
      storedValue.value = initialValue
    } catch (e) {
      onError(e as Error)
    }
  }

  return {
    value: storedValue,
    remove,
    clear: remove,
  }
}
