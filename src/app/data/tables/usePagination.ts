import { computed, ref } from "vue";

export interface UsePaginationOptions {
	currentPage?: number;
	pageSize?: number;
	totalItems?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
	const {
		currentPage: initialPage = 1,
		pageSize: initialSize = 10,
		totalItems: initialTotal = 0,
	} = options;

	const currentPage = ref(initialPage);
	const pageSize = ref(initialSize);
	const totalItems = ref(initialTotal);

	const totalPages = computed(
		() => Math.ceil(totalItems.value / pageSize.value) || 1,
	);

	const hasNextPage = computed(() => currentPage.value < totalPages.value);
	const hasPreviousPage = computed(() => currentPage.value > 1);

	const startIndex = computed(() => (currentPage.value - 1) * pageSize.value);
	const endIndex = computed(() =>
		Math.min(startIndex.value + pageSize.value, totalItems.value),
	);

	const pageNumbers = computed(() => {
		const pages = [];
		const maxVisible = 5;
		let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
		const end = Math.min(totalPages.value, start + maxVisible - 1);

		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		return pages;
	});

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages.value) {
			currentPage.value = page;
		}
	};

	const nextPage = () => {
		if (hasNextPage.value) {
			currentPage.value++;
		}
	};

	const previousPage = () => {
		if (hasPreviousPage.value) {
			currentPage.value--;
		}
	};

	const firstPage = () => {
		currentPage.value = 1;
	};

	const lastPage = () => {
		currentPage.value = totalPages.value;
	};

	const setPageSize = (size: number) => {
		pageSize.value = size;
		currentPage.value = 1; // Reset to first page
	};

	const setTotalItems = (total: number) => {
		totalItems.value = total;
		// Adjust current page if necessary
		if (currentPage.value > totalPages.value) {
			currentPage.value = totalPages.value;
		}
	};

	const reset = () => {
		currentPage.value = initialPage;
		pageSize.value = initialSize;
		totalItems.value = initialTotal;
	};

	return {
		currentPage,
		pageSize,
		totalItems,
		totalPages,
		hasNextPage,
		hasPreviousPage,
		startIndex,
		endIndex,
		pageNumbers,
		goToPage,
		nextPage,
		previousPage,
		firstPage,
		lastPage,
		setPageSize,
		setTotalItems,
		reset,
	};
}

// Helper function to paginate array
export function paginateArray<T>(
	array: T[],
	page: number,
	pageSize: number,
): T[] {
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	return array.slice(startIndex, endIndex);
}
