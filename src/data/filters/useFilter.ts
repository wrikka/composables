import { computed, ref } from "vue";

export interface FilterOption<T> {
	key: keyof T;
	value: any;
	operator?:
		| "equals"
		| "contains"
		| "startsWith"
		| "endsWith"
		| "gt"
		| "gte"
		| "lt"
		| "lte"
		| "in"
		| "nin";
	compareFn?: (item: T[keyof T], value: any) => boolean;
}

export function useFilter<T>(items: T[]) {
	const filters = ref<FilterOption<T>[]>([]);

	const filteredItems = computed(() => {
		if (filters.value.length === 0) return items;

		return items.filter((item) => {
			return filters.value.every((filter) => {
				const { key, value, operator = "equals", compareFn } = filter;
				const itemValue = item[key as keyof T];

				if (compareFn) {
					return compareFn(itemValue, value);
				}

				switch (operator) {
					case "equals":
						return itemValue === value;
					case "contains":
						return (
							typeof itemValue === "string" &&
							itemValue.toLowerCase().includes(String(value).toLowerCase())
						);
					case "startsWith":
						return (
							typeof itemValue === "string" &&
							itemValue.toLowerCase().startsWith(String(value).toLowerCase())
						);
					case "endsWith":
						return (
							typeof itemValue === "string" &&
							itemValue.toLowerCase().endsWith(String(value).toLowerCase())
						);
					case "gt":
						return typeof itemValue === "number" && itemValue > value;
					case "gte":
						return typeof itemValue === "number" && itemValue >= value;
					case "lt":
						return typeof itemValue === "number" && itemValue < value;
					case "lte":
						return typeof itemValue === "number" && itemValue <= value;
					case "in":
						return Array.isArray(value) && value.includes(itemValue);
					case "nin":
						return Array.isArray(value) && !value.includes(itemValue);
					default:
						return itemValue === value;
				}
			});
		});
	});

	const addFilter = (filter: FilterOption<T>) => {
		const existingIndex = filters.value.findIndex((f) => f.key === filter.key);
		if (existingIndex >= 0) {
			filters.value[existingIndex] = filter as any;
		} else {
			filters.value.push(filter as any);
		}
	};

	const updateFilterByObject = (filter: FilterOption<T>) => {
		const existingIndex = filters.value.findIndex((f) => f.key === filter.key);
		if (existingIndex >= 0) {
			filters.value[existingIndex] = filter as any;
		} else {
			filters.value.push(filter as any);
		}
	};

	const removeFilter = (key: keyof T) => {
		filters.value = filters.value.filter((filter) => filter.key !== key);
	};

	const updateFilter = (key: keyof T, updates: Partial<FilterOption<T>>) => {
		const filterIndex = filters.value.findIndex((f) => f.key === key);
		if (filterIndex >= 0) {
			filters.value[filterIndex] = {
				...filters.value[filterIndex],
				...updates,
			} as any;
		}
	};

	const clearFilters = () => {
		filters.value = [];
	};

	const hasFilter = (key: keyof T): boolean => {
		return filters.value.some((filter) => filter.key === key);
	};

	const getFilter = (key: keyof T): FilterOption<T> | undefined => {
		return filters.value.find((filter) => filter.key === key) as any;
	};

	const filterBy = (
		key: keyof T,
		value: any,
		operator?: FilterOption<T>["operator"],
		compareFn?: (item: T[keyof T], value: any) => boolean,
	) => {
		const filterOption: FilterOption<T> = { key: key as any, value };
		if (operator !== undefined) filterOption.operator = operator;
		if (compareFn !== undefined) filterOption.compareFn = compareFn;
		addFilter(filterOption);
	};

	const filterByText = (searchText: string, keys: (keyof T)[]) => {
		clearFilters();
		if (searchText.trim()) {
			keys.forEach((key) => {
				addFilter({ key: key as any, value: searchText, operator: "contains" });
			});
		}
	};

	const filterByRange = (key: keyof T, min: number, max: number) => {
		clearFilters();
		addFilter({ key: key as any, value: min, operator: "gte" });
		addFilter({ key: key as any, value: max, operator: "lte" });
	};

	return {
		filters,
		filteredItems,
		addFilter,
		removeFilter,
		updateFilter,
		updateFilterByObject,
		clearFilters,
		hasFilter,
		getFilter,
		filterBy,
		filterByText,
		filterByRange,
	};
}
