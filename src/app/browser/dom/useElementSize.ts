import { useResizeObserver as useVueUseResizeObserver, type UseResizeObserverReturn } from '@vueuse/core'
import { ref, Ref } from 'vue'

export interface ElementSize {
  width: number
  height: number
  top: number
  left: number
  x: number
  y: number
  right: number
  bottom: number
}

export function useElementSize(target: Ref<HTMLElement | undefined> | HTMLElement | Window | Document): UseResizeObserverReturn {
  const width = ref(0)
  const height = ref(0)
  const top = ref(0)
  const left = ref(0)
  const right = ref(0)
  const bottom = ref(0)
  const x = ref(0)
  const y = ref(0)

  const { stop, start } = useVueUseResizeObserver(target, (entries) => {
    const entry = entries[0]
    if (entry) {
      const rect = entry.contentRect
      width.value = rect.width
      height.value = rect.height
      top.value = rect.top
      left.value = rect.left
      right.value = rect.right
      bottom.value = rect.bottom
      x.value = rect.x
      y.value = rect.y
    }
  })

  return {
    width,
    height,
    top,
    left,
    right,
    bottom,
    x,
    y,
    stop,
    start,
  }
}
