import { ref, onMounted, onUnmounted } from 'vue'

export interface UseWindowSizeOptions {
  initialWidth?: number
  initialHeight?: number
  onChange?: (size: { width: number; height: number }) => void
}

export function useWindowSize(options: UseWindowSizeOptions = {}) {
  const {
    initialWidth = 0,
    initialHeight = 0,
    onChange,
  } = options

  const width = ref(initialWidth)
  const height = ref(initialHeight)

  const update = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
    onChange?.({ width: width.value, height: height.value })
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return {
    width,
    height,
    update,
  }
}
