import { ref, computed } from 'vue'

export interface HistoryOptions<T> {
  maxSize?: number
}

export function useHistory<T = any>(options: HistoryOptions<T> = {}) {
  const { maxSize = 50 } = options

  const history = ref<T[]>([])
  const currentIndex = ref(-1)
  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)

  const push = (state: T) => {
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }

    history.value.push(state)

    if (history.value.length > maxSize) {
      history.value.shift()
    } else {
      currentIndex.value++
    }
  }

  const undo = (): T | undefined => {
    if (canUndo.value) {
      currentIndex.value--
      return history.value[currentIndex.value]
    }
    return undefined
  }

  const redo = (): T | undefined => {
    if (canRedo.value) {
      currentIndex.value++
      return history.value[currentIndex.value]
    }
    return undefined
  }

  const clear = () => {
    history.value = []
    currentIndex.value = -1
  }

  const getCurrent = (): T | undefined => {
    if (currentIndex.value >= 0) {
      return history.value[currentIndex.value]
    }
    return undefined
  }

  return {
    history,
    currentIndex,
    canUndo,
    canRedo,
    push,
    undo,
    redo,
    clear,
    getCurrent,
  }
}
