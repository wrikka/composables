import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useResizableColumns(container: Ref<HTMLElement | null>) {
  const isResizing = ref(false)
  let targetColumn: HTMLElement | null = null
  let startX = 0
  let startWidth = 0

  const onMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('resize-handle')) {
      isResizing.value = true
      targetColumn = target.parentElement
      startX = e.pageX
      if (targetColumn) {
        startWidth = targetColumn.offsetWidth
      }
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing.value || !targetColumn) return
    const diffX = e.pageX - startX
    targetColumn.style.width = `${startWidth + diffX}px`
  }

  const onMouseUp = () => {
    isResizing.value = false
    targetColumn = null
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  onMounted(() => {
    if (container.value) {
      container.value.addEventListener('mousedown', onMouseDown)
    }
  })

  onUnmounted(() => {
    if (container.value) {
      container.value.removeEventListener('mousedown', onMouseDown)
    }
    // Clean up global listeners in case mouseup happens outside the window
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  })

  return {
    isResizing,
  }
}
