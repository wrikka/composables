import { ref } from 'vue';

export type SortDirection = 'asc' | 'desc' | null;

export function useTableSort<T>(items: T[]) {
  const sortedItems = ref<T[]>([...items]);
  const sortKey = ref<string | null>(null);
  const sortDirection = ref<SortDirection>(null);

  function sortBy(key: string, direction: SortDirection = 'asc') {
    sortKey.value = key;
    sortDirection.value = direction;
    applySort();
  }

  function toggleSort(key: string) {
    if (sortKey.value === key) {
      if (sortDirection.value === 'asc') {
        sortDirection.value = 'desc';
      }
      else if (sortDirection.value === 'desc') {
        sortDirection.value = null;
        sortKey.value = null;
      }
      else {
        sortDirection.value = 'asc';
      }
    }
    else {
      sortKey.value = key;
      sortDirection.value = 'asc';
    }
    applySort();
  }

  function applySort() {
    if (!sortKey.value || !sortDirection.value) {
      sortedItems.value = [...items];
      return;
    }

    sortedItems.value = [...items].sort((a, b) => {
      const aValue = (a as any)[sortKey.value!];
      const bValue = (b as any)[sortKey.value!];

      if (aValue < bValue) {
        return sortDirection.value === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection.value === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  function clearSort() {
    sortKey.value = null;
    sortDirection.value = null;
    sortedItems.value = [...items];
  }

  return {
    sortedItems,
    sortKey,
    sortDirection,
    sortBy,
    toggleSort,
    clearSort,
  };
}
