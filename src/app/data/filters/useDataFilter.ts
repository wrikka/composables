import { ref, computed } from "vue";

interface FilterCondition<T> {
	key: keyof T;
	operator: "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "between";
	value: any;
}

interface SavedFilter<T> {
	id: string;
	name: string;
	conditions: FilterCondition<T>[];
}

interface UseDataFilterOptions<T> {
	data: T[];
}

export function useDataFilter<T = any>(options: UseDataFilterOptions<T>) {
	const { data } = options;

	const conditions = ref<FilterCondition<T>[]>([]);
	const savedFilters = ref<SavedFilter<T>[]>([]);
	const activeFilterId = ref<string | null>(null);

	const applyFilter = (item: T, condition: FilterCondition<T>): boolean => {
		const { key, operator, value } = condition;
		const itemValue = item[key];

		switch (operator) {
			case "equals":
				return itemValue === value;
			case "contains":
				return typeof itemValue === "string" && itemValue.toLowerCase().includes(String(value).toLowerCase());
			case "startsWith":
				return typeof itemValue === "string" && itemValue.toLowerCase().startsWith(String(value).toLowerCase());
			case "endsWith":
				return typeof itemValue === "string" && itemValue.toLowerCase().endsWith(String(value).toLowerCase());
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
			case "between":
				return Array.isArray(value) && value.length === 2 && itemValue >= value[0] && itemValue <= value[1];
			default:
				return false;
		}
	};

	const filteredData = computed(() => {
		if (conditions.value.length === 0) return data;

		return data.filter((item) => {
			return conditions.value.every((condition) => applyFilter(item, condition));
		});
	});

	const addCondition = (condition: FilterCondition<T>) => {
		conditions.value.push(condition);
	};

	const removeCondition = (index: number) => {
		conditions.value.splice(index, 1);
	};

	const updateCondition = (index: number, condition: FilterCondition<T>) => {
		conditions.value[index] = condition;
	};

	const clearConditions = () => {
		conditions.value = [];
	};

	const saveFilter = (name: string) => {
		const filter: SavedFilter<T> = {
			id: `filter_${Date.now()}`,
			name,
			conditions: [...conditions.value],
		};
		savedFilters.value.push(filter);
		return filter.id;
	};

	const loadFilter = (id: string) => {
		const filter = savedFilters.value.find((f) => f.id === id);
		if (filter) {
			conditions.value = [...filter.conditions];
			activeFilterId.value = id;
		}
	};

	const deleteFilter = (id: string) => {
		savedFilters.value = savedFilters.value.filter((f) => f.id !== id);
		if (activeFilterId.value === id) {
			activeFilterId.value = null;
		}
	};

	const hasConditions = computed(() => conditions.value.length > 0);

	return {
		conditions,
		savedFilters,
		activeFilterId,
		filteredData,
		hasConditions,
		addCondition,
		removeCondition,
		updateCondition,
		clearConditions,
		saveFilter,
		loadFilter,
		deleteFilter,
	};
}
