import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export function useSelection<T extends Record<string, any>>(
  data: Ref<T[]>,
  key: keyof T
) {
  const selected = ref<Set<T[keyof T]>>(new Set()) as Ref<Set<T[keyof T]>>

  const allSelected = computed({
    get() {
      return data.value.length > 0 && selected.value.size === data.value.length
    },
    set(value: boolean) {
      if (value) {
        selectAll()
      } else {
        clearSelection()
      }
    },
  })

  const noneSelected: ComputedRef<boolean> = computed(() => {
    return selected.value.size === 0
  })

  const someSelected: ComputedRef<boolean> = computed(() => {
    return !noneSelected.value && !allSelected.value
  })

  const selectedItems: ComputedRef<T[]> = computed(() => {
    return data.value.filter(item => selected.value.has(item[key]))
  })

  function toggleSelection(item: T) {
    const itemKey = item[key]
    if (selected.value.has(itemKey)) {
      selected.value.delete(itemKey)
    } else {
      selected.value.add(itemKey)
    }
  }

  function selectAll() {
    selected.value = new Set(data.value.map(item => item[key]))
  }

  function clearSelection() {
    selected.value.clear()
  }

  function isSelected(item: T): boolean {
    return selected.value.has(item[key])
  }

  return {
    selected,
    selectedItems,
    allSelected,
    noneSelected,
    someSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  }
}
