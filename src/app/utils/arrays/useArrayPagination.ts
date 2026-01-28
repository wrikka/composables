import { ref, computed } from 'vue';

export function useArrayPagination<T>(items: T[], itemsPerPage: number = 10) {
  const currentPage = ref(1);

  const totalPages = computed(() => Math.ceil(items.length / itemsPerPage));

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  });

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  }

  function previousPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }

  function firstPage() {
    currentPage.value = 1;
  }

  function lastPage() {
    currentPage.value = totalPages.value;
  }

  function reset() {
    currentPage.value = 1;
  }

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    reset,
  };
}
