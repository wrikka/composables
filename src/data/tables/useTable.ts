import { computed, ref } from "vue";

export interface TableColumn<T = any> {
	key: keyof T;
	label: string;
	sortable?: boolean;
	filterable?: boolean;
	width?: string;
	render?: (value: any, row: T) => any;
}

export interface UseTableOptions<T> {
	data: T[];
	columns: TableColumn<T>[];
	initialSortBy?: keyof T;
	initialSortOrder?: "asc" | "desc";
	initialPage?: number;
	initialPageSize?: number;
	searchable?: boolean;
	searchFields?: (keyof T)[];
}

export function useTable<T extends Record<string, any>>(
	options: UseTableOptions<T>,
) {
	const {
		data,
		columns,
		initialSortBy,
		initialSortOrder = "asc",
		initialPage = 1,
		initialPageSize = 10,
		searchable = true,
		searchFields = [],
	} = options;

	// Search
	const searchQuery = ref("");
	const allSearchFields =
		searchFields.length > 0 ? searchFields : columns.map((col) => col.key);

	// Sorting
	const sortBy = ref<keyof T | undefined>(initialSortBy);
	const sortOrder = ref<"asc" | "desc">(initialSortOrder);

	// Filtering
	const filters = ref<Record<string, any>>({});

	// Pagination
	const currentPage = ref(initialPage);
	const pageSize = ref(initialPageSize);

	// Computed filtered and sorted data
	const filteredData = computed(() => {
		let result = [...data];

		// Apply search
		if (searchQuery.value.trim()) {
			result = result.filter((row) => {
				return allSearchFields.some((field) => {
					const value = row[field];
					return (
						value &&
						String(value)
							.toLowerCase()
							.includes(searchQuery.value.toLowerCase())
					);
				});
			});
		}

		// Apply filters
		Object.entries(filters.value).forEach(([key, filterValue]) => {
			if (
				filterValue !== "" &&
				filterValue !== null &&
				filterValue !== undefined
			) {
				result = result.filter((row) => {
					const value = row[key];
					if (typeof filterValue === "string") {
						return String(value)
							.toLowerCase()
							.includes(filterValue.toLowerCase());
					}
					return value === filterValue;
				});
			}
		});

		return result;
	});

	const sortedData = computed(() => {
		if (!sortBy.value) return filteredData.value;

		return [...filteredData.value].sort((a, b) => {
			const aValue = a[sortBy.value];
			const bValue = b[sortBy.value];

			if (aValue === null || aValue === undefined) return 1;
			if (bValue === null || bValue === undefined) return -1;

			let comparison = 0;
			if (aValue < bValue) comparison = -1;
			if (aValue > bValue) comparison = 1;

			return sortOrder.value === "desc" ? -comparison : comparison;
		});
	});

	// Pagination
	const totalItems = computed(() => sortedData.value.length);
	const totalPages = computed(() =>
		Math.ceil(totalItems.value / pageSize.value),
	);
	const startIndex = computed(() => (currentPage.value - 1) * pageSize.value);
	const endIndex = computed(() =>
		Math.min(startIndex.value + pageSize.value, totalItems.value),
	);

	const paginatedData = computed(() => {
		return sortedData.value.slice(startIndex.value, endIndex.value);
	});

	// Actions
	const setSort = (key: keyof T) => {
		if (sortBy.value === key) {
			sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
		} else {
			sortBy.value = key;
			sortOrder.value = "asc";
		}
		currentPage.value = 1; // Reset to first page
	};

	const setFilter = (key: string, value: any) => {
		filters.value[key] = value;
		currentPage.value = 1; // Reset to first page
	};

	const clearFilter = (key: string) => {
		delete filters.value[key];
		currentPage.value = 1; // Reset to first page
	};

	const clearAllFilters = () => {
		filters.value = {};
		searchQuery.value = "";
		currentPage.value = 1; // Reset to first page
	};

	const setSearch = (query: string) => {
		searchQuery.value = query;
		currentPage.value = 1; // Reset to first page
	};

	const setPage = (page: number) => {
		if (page >= 1 && page <= totalPages.value) {
			currentPage.value = page;
		}
	};

	const setPageSize = (size: number) => {
		pageSize.value = size;
		currentPage.value = 1; // Reset to first page
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

	// Utility functions
	const getCellValue = (row: T, column: TableColumn<T>) => {
		const value = row[column.key];
		return column.render ? column.render(value, row) : value;
	};

	const getUniqueValues = (key: keyof T) => {
		return [...new Set(data.map((row) => row[key]).filter(Boolean))];
	};

	const isSortedBy = (key: keyof T) => {
		return sortBy.value === key;
	};

	const getSortDirection = (key: keyof T) => {
		return isSortedBy(key) ? sortOrder.value : null;
	};

	// Export pagination hooks
	const pagination = {
		currentPage,
		pageSize,
		totalItems,
		totalPages,
		startIndex,
		endIndex,
		setPage,
		setPageSize,
		nextPage,
		prevPage,
		firstPage,
		lastPage,
	};

	return {
		// Data
		data: paginatedData,
		allData: data,
		filteredData,
		sortedData,

		// Search
		searchQuery,
		setSearch,
		searchable,

		// Sorting
		sortBy,
		sortOrder,
		setSort,
		isSortedBy,
		getSortDirection,

		// Filtering
		filters,
		setFilter,
		clearFilter,
		clearAllFilters,
		getUniqueValues,

		// Pagination
		...pagination,

		// Utilities
		columns,
		getCellValue,
	};
}
