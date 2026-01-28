import { ref, watch } from 'vue'

export function useDebounce<T>(value: () => T, delay = 300) {
  const debounced = ref<T>(value())
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(
    () => value(),
    (newValue) => {
      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(() => {
        debounced.value = newValue
      }, delay)
    },
    { immediate: true }
  )

  return debounced
}
