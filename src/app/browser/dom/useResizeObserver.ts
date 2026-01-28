import { ref, onMounted, onUnmounted } from 'vue'

export interface ResizeObserverState {
  width: number
  height: number
  observe: (element: HTMLElement) => void
  unobserve: () => void
}

export function useResizeObserver() {
  const width = ref(0)
  const height = ref(0)
  let observer: ResizeObserver | null = null

  const observe = (element: HTMLElement) => {
    if (observer) {
      observer.disconnect()
    }

    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect
        width.value = w
        height.value = h
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
    width,
    height,
    observe,
    unobserve,
  }
}
