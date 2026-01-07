import { ref, shallowRef, onMounted, onUnmounted, type Ref, watch, getCurrentInstance, toRaw } from 'vue'

export interface IntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
}

export interface IntersectionResult {
  isIntersecting: boolean
  intersectionRatio: number
  target: Element
  entry: IntersectionObserverEntry
}

export function useIntersectionObserver(
  target: Element | Ref<Element | null> | (() => Element | null),
  options: IntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px'
  } = options

  const isSupported = ref(!!(globalThis as any).IntersectionObserver)
  const isIntersecting = ref(false)
  const intersectionRatio = ref(0)
  const targetElement = shallowRef<Element | null>(null)
  const entries = ref<IntersectionObserverEntry[]>([])

  let observer: IntersectionObserver | null = null

  const getTargetElement = (): Element | null => {
    if (typeof target === 'function') {
      return target()
    } else if (target !== null && typeof target === 'object' && 'value' in target) {
      return toRaw(target.value)
    } else {
      return target
    }
  }

  const setupObserver = () => {
    if (!isSupported.value) return

    const IntersectionObserverCtor = (globalThis as any)
      .IntersectionObserver as (typeof IntersectionObserver | undefined)
    if (!IntersectionObserverCtor) return

    const element = getTargetElement()
    if (!element) return

    targetElement.value = element

    const handler = (observerEntries: IntersectionObserverEntry[]) => {
      entries.value = observerEntries

      for (const entry of observerEntries) {
        if (entry.target === element) {
          isIntersecting.value = entry.isIntersecting
          intersectionRatio.value = entry.intersectionRatio
          break
        }
      }
    }

    const observerOptions: IntersectionObserverInit = {
      threshold,
      rootMargin,
      ...(root ? { root } : {}),
    }

    const ctorArgs: [IntersectionObserverCallback, IntersectionObserverInit] = [
      handler,
      observerOptions,
    ]

    try {
      if ((IntersectionObserverCtor as any).mock) {
        observer = (IntersectionObserverCtor as any)(...ctorArgs)
      } else {
        observer = Reflect.construct(IntersectionObserverCtor as any, ctorArgs) as any
      }
    } catch {
      observer = null
    }

    observer?.observe?.(element)
  }

  const start = () => {
    if (observer) {
      stop()
    }
    setupObserver()
  }

  const stop = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    isIntersecting.value = false
    intersectionRatio.value = 0
    entries.value = []
  }

  const pause = () => {
    if (observer) {
      observer.unobserve(targetElement.value!)
    }
  }

  const resume = () => {
    if (observer && targetElement.value) {
      observer.observe(targetElement.value)
    }
  }

  const updateOptions = (newOptions: Partial<IntersectionObserverOptions>) => {
    Object.assign(options, newOptions)
    start()
  }

  setupObserver()

  const instance = getCurrentInstance()
  if (instance) {
    onUnmounted(() => {
      stop()
    })
  }

  return {
    isSupported,
    isIntersecting,
    intersectionRatio,
    targetElement,
    entries,
    start,
    stop,
    pause,
    resume,
    updateOptions
  }
}

// Multiple elements intersection observer
export function useIntersectionObserverMultiple(
  targets: (Element | Ref<Element | null> | (() => Element | null))[],
  options: IntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px'
  } = options

  const isSupported = ref(!!(globalThis as any).IntersectionObserver)
  const results = ref<Map<Element, IntersectionResult>>(new Map())
  const entries = ref<IntersectionObserverEntry[]>([])

  let observer: IntersectionObserver | null = null

  const getTargetElements = (): Element[] => {
    return targets
      .map(target => {
        if (typeof target === 'function') {
          return target()
        } else if (target !== null && typeof target === 'object' && 'value' in target) {
          return target.value
        } else {
          return target
        }
      })
      .filter(Boolean) as Element[]
  }

  const setupObserver = () => {
    if (!isSupported.value) return

    const IntersectionObserverCtor = (globalThis as any)
      .IntersectionObserver as (typeof IntersectionObserver | undefined)
    if (!IntersectionObserverCtor) return

    const elements = getTargetElements()
    if (elements.length === 0) return

    const handler = (observerEntries: IntersectionObserverEntry[]) => {
      entries.value = observerEntries

      for (const entry of observerEntries) {
        const result: IntersectionResult = {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          target: entry.target,
          entry,
        }
        results.value.set(entry.target, result)
      }
    }

    const ctorArgs: [IntersectionObserverCallback, IntersectionObserverInit] = [
      handler,
      {
        threshold,
        root,
        rootMargin,
      },
    ]

    try {
      observer = Reflect.construct(IntersectionObserverCtor as any, ctorArgs) as any
    } catch {
      try {
        observer = (IntersectionObserverCtor as any)(...ctorArgs)
      } catch {
        observer = null
      }
    }

    if (!observer?.observe) return

    elements.forEach(element => {
      observer!.observe(element)
    })
  }

  const start = () => {
    if (observer) {
      stop()
    }
    setupObserver()
  }

  const stop = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    results.value.clear()
    entries.value = []
  }

  const getResult = (target: Element): IntersectionResult | undefined => {
    return results.value.get(target)
  }

  const isIntersecting = (target: Element): boolean => {
    return results.value.get(target)?.isIntersecting ?? false
  }

  const getIntersectionRatio = (target: Element): number => {
    return results.value.get(target)?.intersectionRatio ?? 0
  }

  // Initialize immediately so unit tests (without mounting) can still work
  setupObserver()

  {
    const instance = getCurrentInstance()
    if (instance) {
      onMounted(() => {
        if (!observer) setupObserver()
      })

      onUnmounted(() => {
        stop()
      })
    }
  }

  return {
    isSupported,
    results,
    entries,
    start,
    stop,
    getResult,
    isIntersecting,
    getIntersectionRatio
  }
}

// Lazy loading helper
export function useLazyLoad(
  target: Element | Ref<Element | null> | (() => Element | null),
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverOptions = {}
) {
  const { isIntersecting, entries, start, stop } = useIntersectionObserver(target, {
    threshold: 0.1,
    ...options
  })

  let hasTriggered = ref(false)

  const handleIntersection = () => {
    if (isIntersecting.value && !hasTriggered.value) {
      hasTriggered.value = true
      const entry = entries.value.find(e => e.isIntersecting)
      if (entry) {
        callback(entry)
        stop() // Stop observing after callback
      }
    }
  }

  const reset = () => {
    hasTriggered.value = false
    start()
  }

  // Watch for intersection changes
  const unwatch = watch(isIntersecting, handleIntersection, { flush: 'sync' })

  {
    const instance = getCurrentInstance()
    if (instance) {
      onUnmounted(() => {
        unwatch()
      })
    }
  }

  return {
    isIntersecting,
    hasTriggered,
    reset,
    start,
    stop
  }
}
