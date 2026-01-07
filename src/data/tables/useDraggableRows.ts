import { ref, watch } from 'vue'
import type { Ref } from 'vue'

export function useDraggableRows<T>(data: Ref<T[]>) {
  const list = ref(data.value) as Ref<T[]>
  const draggingItem = ref<T | null>(null)

  watch(data, (newData) => {
    list.value = newData
  })

  const onDragStart = (item: T) => {
    draggingItem.value = item
  }

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  const onDrop = (targetItem: T) => {
    if (!draggingItem.value) return

    const fromIndex = list.value.indexOf(draggingItem.value)
    const toIndex = list.value.indexOf(targetItem)

    if (fromIndex > -1 && toIndex > -1) {
      const [removed] = list.value.splice(fromIndex, 1)
      if (removed) {
        list.value.splice(toIndex, 0, removed)
      }
    }

    draggingItem.value = null
    // Emit an event or update the original data ref
    data.value = [...list.value]
  }

  return {
    list,
    onDragStart,
    onDragOver,
    onDrop,
  }
}
