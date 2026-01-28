import { ref, computed } from 'vue';

export function useTableSelection<T>(items: T[]) {
  const selectedItems = ref<Set<T>>(new Set());
  const isAllSelected = computed(() => items.length > 0 && selectedItems.value.size === items.length);
  const isIndeterminate = computed(() => selectedItems.value.size > 0 && selectedItems.value.size < items.length);

  function toggleSelection(item: T) {
    if (selectedItems.value.has(item)) {
      selectedItems.value.delete(item);
    }
    else {
      selectedItems.value.add(item);
    }
  }

  function selectAll() {
    items.forEach(item => selectedItems.value.add(item));
  }

  function clearSelection() {
    selectedItems.value.clear();
  }

  function isSelected(item: T): boolean {
    return selectedItems.value.has(item);
  }

  function getSelectedCount(): number {
    return selectedItems.value.size;
  }

  function getSelectedItems(): T[] {
    return Array.from(selectedItems.value);
  }

  return {
    selectedItems,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    getSelectedCount,
    getSelectedItems,
  };
}
