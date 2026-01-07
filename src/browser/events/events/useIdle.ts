import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'

export interface UseIdleOptions {
  timeout?: number
  events?: string[]
  initialState?: boolean
}

export function useIdle(options: UseIdleOptions = {}) {
  const {
    timeout = 60000, // 1 minute
    events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ],
    initialState = false
  } = options

  const idle = ref(initialState)
  const lastActive = ref(Date.now())

  let timeoutId: NodeJS.Timeout | null = null
  let isRunning = false

  const setupListeners = () => {
    events.forEach((event) => {
      document.addEventListener(event, handleActivity as EventListener, { passive: true })
    })
  }

  const cleanupListeners = () => {
    events.forEach((event) => {
      document.removeEventListener(event, handleActivity as EventListener)
    })
  }

  const handleActivity = () => {
    if (!isRunning) return
    lastActive.value = Date.now()
    
    if (idle.value) {
      idle.value = false
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      idle.value = true
      timeoutId = null
    }, timeout)
  }

  const start = () => {
    isRunning = true
    handleActivity()
  }

  const stop = () => {
    isRunning = false
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const reset = () => {
    idle.value = initialState
    lastActive.value = Date.now()

    if (isRunning) {
      start()
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  }

  // Initialize immediately so unit tests (without mounting) can still work
  setupListeners()
  if (!initialState) {
    start()
  }

  const instance = getCurrentInstance()
  if (instance) {
    onMounted(() => {
      // no-op: already initialized
    })

    onUnmounted(() => {
      stop()
      cleanupListeners()
    })
  }

  return {
    idle,
    lastActive,
    start,
    stop,
    reset
  }
}
