import { ref, onMounted, onUnmounted } from 'vue'

export interface DragDropState {
  isDragging: boolean
  dragData: any
  onDragStart: (data: any) => void
  onDragEnd: () => void
  onDrop: (data: any) => void
}

export function useDragDrop() {
  const isDragging = ref(false)
  const dragData = ref<any>(null)

  const onDragStart = (data: any) => {
    dragData.value = data
    isDragging.value = true
  }

  const onDragEnd = () => {
    isDragging.value = false
    dragData.value = null
  }

  const onDrop = (data: any) => {
    return data
  }

  return {
    isDragging,
    dragData,
    onDragStart,
    onDragEnd,
    onDrop,
  }
}
