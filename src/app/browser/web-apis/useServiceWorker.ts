import { ref, onUnmounted } from 'vue'

export interface ServiceWorkerState {
  register: (scriptURL: string) => Promise<ServiceWorkerRegistration | null>
  unregister: () => Promise<void>
  update: () => Promise<void>
  registration: ServiceWorkerRegistration | null
  isRegistering: boolean
  isUpdating: boolean
  error: Error | null
}

export function useServiceWorker() {
  const registration = ref<ServiceWorkerRegistration | null>(null)
  const isRegistering = ref(false)
  const isUpdating = ref(false)
  const error = ref<Error | null>(null)

  const register = async (scriptURL: string): Promise<ServiceWorkerRegistration | null> => {
    isRegistering.value = true
    error.value = null

    try {
      registration.value = await navigator.serviceWorker.register(scriptURL)
      return registration.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isRegistering.value = false
    }
  }

  const unregister = async (): Promise<void> => {
    if (registration.value) {
      await registration.value.unregister()
      registration.value = null
    }
  }

  const update = async (): Promise<void> => {
    if (!registration.value) return

    isUpdating.value = true
    error.value = null

    try {
      await registration.value.update()
    } catch (err) {
      error.value = err as Error
    } finally {
      isUpdating.value = false
    }
  }

  onUnmounted(async () => {
    if (registration.value) {
      await registration.value.unregister()
    }
  })

  return {
    register,
    unregister,
    update,
    registration,
    isRegistering,
    isUpdating,
    error,
  }
}
