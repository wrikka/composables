import { ref, watch, type Ref } from 'vue'
import type { UseStorageReturn } from './types'

export interface UseLocalStorageOptions<T> {
  serializer?: {
    read: (value: string) => T
    write: (value: T) => string
  }
  onError?: (error: Error) => void
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseStorageReturn<T> {
  const { 
    serializer = { 
      read: (v: string) => JSON.parse(v) as T, 
      write: (v: T) => JSON.stringify(v) 
    },
    onError = (e: Error) => console.error(e)
  } = options

  const storedValue = ref(initialValue) as Ref<T>

  function read(): void {
    try {
      const rawValue = localStorage.getItem(key)
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
      localStorage.setItem(key, serializer.write(newValue))
    } catch (e) {
      onError(e as Error)
    }
  }, { deep: true })

  const remove = () => {
    try {
      localStorage.removeItem(key)
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
