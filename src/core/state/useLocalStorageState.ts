import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'

export interface UseLocalStorageStateOptions<T> {
  serializer?: {
    read: (value: string) => T
    write: (value: T) => string
  }
  onError?: (error: Error) => void
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageStateOptions<T> = {}
) {
  const {
    serializer = {
      read: (value: string) => {
        try {
          return JSON.parse(value) as T
        } catch {
          return value as T
        }
      },
      write: (value: T) => JSON.stringify(value)
    },
    onError = (error) => console.error(error)
  } = options

  const state = ref<T>(initialValue as T) as Ref<T>

  const setStoredValue = (value: T) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serializer.write(value))
      }
    } catch (error) {
      onError(error as Error)
    }
  }

  const getStoredValue = (): T | null => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key)
        if (item !== null) {
          return serializer.read(item)
        }
      }
    } catch (error) {
      onError(error as Error)
    }
    return null
  }

  // Initialize with stored value or initial value
  onMounted(() => {
    const storedValue = getStoredValue()
    if (storedValue !== null) {
      state.value = storedValue
    } else if (typeof initialValue === 'function') {
      state.value = (initialValue as () => T)()
    }
  })

  // Watch for changes and update localStorage
  watch(
    state,
    (newValue) => {
      setStoredValue(newValue)
    },
    { deep: true }
  )

  // Listen for storage events from other tabs
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === key && event.newValue !== null) {
      state.value = serializer.read(event.newValue)
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    if (typeof value === 'function') {
      state.value = (value as (prev: T) => T)(state.value)
    } else {
      state.value = value
    }
  }

  const removeValue = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
      state.value = initialValue as T
    } catch (error) {
      onError(error as Error)
    }
  }

  return {
    state,
    setValue,
    removeValue
  }
}
