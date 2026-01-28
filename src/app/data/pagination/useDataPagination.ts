import { ref, computed, watch } from "vue";

interface PaginationOptions {
	initialPage?: number;
	initialPageSize?: number;
	totalItems?: number;
	infiniteScroll?: boolean;
	scrollThreshold?: number;
}

interface PaginationState {
	currentPage: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	hasMore: boolean;
}

export function useDataPagination<T = any>(options: PaginationOptions = {}) {
	const {
		initialPage = 1,
		initialPageSize = 10,
		totalItems: initialTotalItems = 0,
		infiniteScroll = false,
		scrollThreshold = 0.8,
	} = options;

	const currentPage = ref(initialPage);
	const pageSize = ref(initialPageSize);
	const totalItems = ref(initialTotalItems);
	const isLoading = ref(false);
	const error = ref<Error | null>(null);

	const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));

	const hasMore = computed(() => {
		if (infiniteScroll) {
			return currentPage.value * pageSize.value < totalItems.value;
		}
		return currentPage.value < totalPages.value;
	});

	const startIndex = computed(() => (currentPage.value - 1) * pageSize.value);
	const endIndex = computed(() =>
		Math.min(startIndex.value + pageSize.value, totalItems.value),
	);

	const setPage = (page: number) => {
		if (page >= 1 && page <= totalPages.value) {
			currentPage.value = page;
		}
	};

	const nextPage = () => {
		if (currentPage.value < totalPages.value) {
			currentPage.value++;
		}
	};

	const prevPage = () => {
		if (currentPage.value > 1) {
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
		currentPage.value = 1;
	};

	const loadMore = async (fetchFn: (page: number, pageSize: number) => Promise<T[]>) => {
		if (isLoading.value || !hasMore.value) return [];

		isLoading.value = true;
		error.value = null;

		try {
			const data = await fetchFn(currentPage.value, pageSize.value);
			totalItems.value = data.length;
			return data;
		} catch (e) {
			error.value = e as Error;
			return [];
		} finally {
			isLoading.value = false;
		}
	};

	const loadNextPage = async (fetchFn: (page: number, pageSize: number) => Promise<T[]>) => {
		if (!hasMore.value) return [];

		currentPage.value++;
		return loadMore(fetchFn);
	};

	const reset = () => {
		currentPage.value = initialPage;
		pageSize.value = initialPageSize;
		totalItems.value = initialTotalItems;
		isLoading.value = false;
		error.value = null;
	};

	const paginationState = computed<PaginationState>(() => ({
		currentPage: currentPage.value,
		pageSize: pageSize.value,
		totalPages: totalPages.value,
		totalItems: totalItems.value,
		hasMore: hasMore.value,
	}));

	return {
		currentPage,
		pageSize,
		totalPages,
		totalItems,
		startIndex,
		endIndex,
		hasMore,
		isLoading,
		error,
		setPage,
		nextPage,
		prevPage,
		firstPage,
		lastPage,
		setPageSize,
		loadMore,
		loadNextPage,
		reset,
		state: paginationState,
	};
}
