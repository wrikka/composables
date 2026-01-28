import { ref, watch } from 'vue'

export function useThrottle<T>(value: () => T, delay = 300) {
  const throttled = ref<T>(value())
  let lastCall = 0

  watch(
    () => value(),
    (newValue) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        throttled.value = newValue
        lastCall = now
      }
    },
    { immediate: true }
  )

  return throttled
}
