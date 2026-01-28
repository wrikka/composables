import { ref, computed } from 'vue';

export function useSearch<T>(items: T[]) {
  const searchTerm = ref('');
  const searchFields = ref<string[]>([]);

  const searchResults = computed(() => {
    if (!searchTerm.value) {
      return items;
    }

    const term = searchTerm.value.toLowerCase();

    return items.filter((item) => {
      if (searchFields.value.length === 0) {
        return Object.values(item as any).some(
          value => String(value).toLowerCase().includes(term),
        );
      }

      return searchFields.value.some((field) => {
        const value = (item as any)[field];
        return String(value).toLowerCase().includes(term);
      });
    });
  });

  function setSearch(term: string) {
    searchTerm.value = term;
  }

  function setSearchFields(fields: string[]) {
    searchFields.value = fields;
  }

  function addSearchField(field: string) {
    if (!searchFields.value.includes(field)) {
      searchFields.value.push(field);
    }
  }

  function removeSearchField(field: string) {
    searchFields.value = searchFields.value.filter(f => f !== field);
  }

  function clearSearch() {
    searchTerm.value = '';
  }

  return {
    searchTerm,
    searchFields,
    searchResults,
    setSearch,
    setSearchFields,
    addSearchField,
    removeSearchField,
    clearSearch,
  };
}
