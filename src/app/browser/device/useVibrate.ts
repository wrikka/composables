import { ref, onUnmounted } from 'vue'

export function useVibrate() {
  const isVibrating = ref(false)

  const vibrate = (pattern: number | number[] = 200): void => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
      isVibrating.value = true
      setTimeout(() => {
        isVibrating.value = false
      }, Array.isArray(pattern) ? pattern.reduce((a, b) => a + b, 0) : pattern)
    }
  }

  const stop = (): void => {
    if ('vibrate' in navigator) {
      navigator.vibrate(0)
      isVibrating.value = false
    }
  }

  return {
    isVibrating,
    vibrate,
    stop,
  }
}
