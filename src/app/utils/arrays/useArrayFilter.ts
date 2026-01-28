import { ref } from 'vue';

export function useArrayFilter<T>(items: T[]) {
  const filters = ref<Record<string, any>>({});
  const filteredItems = ref<T[]>([...items]);

  function addFilter(key: string, value: any) {
    filters.value[key] = value;
    applyFilters();
  }

  function removeFilter(key: string) {
    delete filters.value[key];
    applyFilters();
  }

  function clearFilters() {
    filters.value = {};
    filteredItems.value = [...items];
  }

  function applyFilters() {
    filteredItems.value = items.filter((item) => {
      return Object.entries(filters.value).every(([key, value]) => {
        const itemValue = (item as any)[key];
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        if (typeof value === 'function') {
          return value(itemValue);
        }
        return itemValue === value;
      });
    });
  }

  return {
    filters,
    filteredItems,
    addFilter,
    removeFilter,
    clearFilters,
    applyFilters,
  };
}
