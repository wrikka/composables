import { computed, type Ref, ref } from "vue";

export interface UseFilterOptions<T> {
	initialFilters?: Ref<Array<(item: T) => boolean>>;
}

export function useFilter<T>(
	data: Ref<T[]>,
	options: UseFilterOptions<T> = {},
) {
	const { initialFilters } = options;

	const filters = ref<Array<(item: T) => boolean>>(
		initialFilters?.value ? [...initialFilters.value] : [],
	);

	const filteredData = computed(() => {
		if (filters.value.length === 0) return data.value;

		return data.value.filter((item) => filters.value.every((fn) => fn(item)));
	});

	const addFilter = (filterFn: (item: T) => boolean) => {
		filters.value.push(filterFn);
	};

	const removeFilter = (filterFn: (item: T) => boolean) => {
		filters.value = filters.value.filter((fn) => fn !== filterFn);
	};

	const clearFilters = () => {
		filters.value = [];
	};

	return {
		filters,
		filteredData,
		addFilter,
		removeFilter,
		clearFilters,
	};
}
