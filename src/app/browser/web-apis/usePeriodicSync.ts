import { ref } from 'vue'

export interface PeriodicSyncState {
  register: (tag: string, options?: { minInterval: number }) => Promise<void>
  unregister: (tag: string) => Promise<void>
  isRegistering: boolean
  isUnregistering: boolean
  error: Error | null
}

export function usePeriodicSync() {
  const isRegistering = ref(false)
  const isUnregistering = ref(false)
  const error = ref<Error | null>(null)

  const register = async (tag: string, options?: { minInterval: number }): Promise<void> => {
    isRegistering.value = true
    error.value = null

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.periodicSync.register(tag, options)
    } catch (err) {
      error.value = err as Error
    } finally {
      isRegistering.value = false
    }
  }

  const unregister = async (tag: string): Promise<void> => {
    isUnregistering.value = true
    error.value = null

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.periodicSync.unregister(tag)
    } catch (err) {
      error.value = err as Error
    } finally {
      isUnregistering.value = false
    }
  }

  return {
    register,
    unregister,
    isRegistering,
    isUnregistering,
    error,
  }
}
