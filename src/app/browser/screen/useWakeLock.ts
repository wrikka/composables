import { ref, onUnmounted } from 'vue'

export function useWakeLock() {
  const isLocked = ref(false)
  const error = ref<Error | null>(null)
  let wakeLock: WakeLockSentinel | null = null

  const lock = async (): Promise<void> => {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen')
        isLocked.value = true
        error.value = null

        wakeLock.addEventListener('release', () => {
          isLocked.value = false
          wakeLock = null
        })
      }
    } catch (err) {
      error.value = err as Error
      isLocked.value = false
    }
  }

  const unlock = (): void => {
    if (wakeLock) {
      wakeLock.release()
      wakeLock = null
      isLocked.value = false
    }
  }

  onUnmounted(() => {
    unlock()
  })

  return {
    isLocked,
    error,
    lock,
    unlock,
  }
}
