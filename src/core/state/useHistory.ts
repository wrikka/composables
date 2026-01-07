import { ref, computed } from 'vue'

export interface UseHistoryOptions<T> {
  capacity?: number
  initial?: T[]
}

export function useHistory<T>(options: UseHistoryOptions<T> = {}) {
  const { capacity = 100, initial = [] } = options
  const history = ref<T[]>([...initial])
  const currentIndex = ref(-1)

  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)
  const current = computed(() => history.value[currentIndex.value] || null)

  const push = (value: T) => {
    // Remove any items after current index
    history.value = history.value.slice(0, currentIndex.value + 1)
    
    // Add new value
    history.value.push(value as any)
    currentIndex.value = history.value.length - 1

    // Maintain capacity
    if (history.value.length > capacity) {
      history.value.shift()
      currentIndex.value--
    }
  }

  const undo = () => {
    if (canUndo.value) {
      currentIndex.value--
      return current.value
    }
    return null
  }

  const redo = () => {
    if (canRedo.value) {
      currentIndex.value++
      return current.value
    }
    return null
  }

  const goto = (index: number) => {
    if (index >= 0 && index < history.value.length) {
      currentIndex.value = index
      return current.value
    }
    return null
  }

  const clear = () => {
    history.value = []
    currentIndex.value = -1
  }

  const replace = (index: number, value: T) => {
    if (index >= 0 && index < history.value.length) {
      history.value[index] = value as any
      if (index === currentIndex.value) {
        return current.value
      }
    }
    return null
  }

  // Initialize with first item if available
  if (history.value.length > 0) {
    currentIndex.value = 0
  }

  return {
    history,
    currentIndex,
    current,
    canUndo,
    canRedo,
    push,
    undo,
    redo,
    goto,
    clear,
    replace
  }
}
