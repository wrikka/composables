import { ref, computed } from 'vue'

export interface Column<T> {
  key: keyof T | string
  label: string
  isVisible?: boolean
  isResizable?: boolean
  width?: string | number
}

export function useColumn<T>(initialColumn: Column<T>) {
  const column = ref(initialColumn)

  const isVisible = ref(initialColumn.isVisible !== false)
  const width = ref(initialColumn.width)

  const headerClasses = computed(() => ({
    'resizable': column.value.isResizable,
  }))

  function toggleVisibility() {
    isVisible.value = !isVisible.value
  }

  function setWidth(newWidth: string | number) {
    if (column.value.isResizable) {
      width.value = newWidth
    }
  }

  return {
    column,
    isVisible,
    width,
    headerClasses,
    toggleVisibility,
    setWidth,
  }
}
