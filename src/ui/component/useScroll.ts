import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useScroll(element: Ref<HTMLElement | null> | Window = window) {
  const x = ref(0)
  const y = ref(0)

  const update = () => {
    if (element instanceof Window) {
      x.value = window.scrollX
      y.value = window.scrollY
    } else if (element.value) {
      x.value = element.value.scrollLeft
      y.value = element.value.scrollTop
    }
  }

  onMounted(() => {
    const target = element instanceof Window ? element : element.value
    target?.addEventListener('scroll', update, { passive: true })
  })

  onUnmounted(() => {
    const target = element instanceof Window ? element : element.value
    target?.removeEventListener('scroll', update)
  })

  return { x, y }
}
