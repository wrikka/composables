import { ref } from 'vue'

export interface BackgroundSyncState {
  register: (tag: string) => Promise<void>
  sync: (tag: string) => Promise<void>
  isRegistering: boolean
  isSyncing: boolean
  error: Error | null
}

export function useBackgroundSync() {
  const isRegistering = ref(false)
  const isSyncing = ref(false)
  const error = ref<Error | null>(null)

  const register = async (tag: string): Promise<void> => {
    isRegistering.value = true
    error.value = null

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(tag)
    } catch (err) {
      error.value = err as Error
    } finally {
      isRegistering.value = false
    }
  }

  const sync = async (tag: string): Promise<void> => {
    isSyncing.value = true
    error.value = null

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.getTags()
    } catch (err) {
      error.value = err as Error
    } finally {
      isSyncing.value = false
    }
  }

  return {
    register,
    sync,
    isRegistering,
    isSyncing,
    error,
  }
}
