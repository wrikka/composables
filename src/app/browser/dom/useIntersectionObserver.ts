import { ref, onMounted, onUnmounted } from 'vue'

export interface IntersectionObserverState {
  isIntersecting: boolean
  observe: (element: HTMLElement) => void
  unobserve: () => void
}

export function useIntersectionObserver() {
  const isIntersecting = ref(false)
  let observer: IntersectionObserver | null = null

  const observe = (element: HTMLElement) => {
    if (observer) {
      observer.disconnect()
    }

    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        isIntersecting.value = entry.isIntersecting
      }
    })

    observer.observe(element)
  }

  const unobserve = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onUnmounted(() => {
    unobserve()
  })

  return {
    isIntersecting,
    observe,
    unobserve,
  }
}
