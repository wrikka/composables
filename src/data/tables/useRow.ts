import { ref, computed } from 'vue'

export function useRow<T extends Record<string, any>>(item: T) {
  const isHovered = ref(false)
  const isExpanded = ref(false)

  const rowClasses = computed(() => ({
    'hover': isHovered.value,
    'expanded': isExpanded.value,
  }))

  function onMouseover() {
    isHovered.value = true
  }

  function onMouseleave() {
    isHovered.value = false
  }

  function toggleExpand() {
    isExpanded.value = !isExpanded.value
  }

  return {
    item,
    isHovered,
    isExpanded,
    rowClasses,
    onMouseover,
    onMouseleave,
    toggleExpand,
  }
}
