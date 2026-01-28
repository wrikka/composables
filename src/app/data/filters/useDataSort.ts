import { ref, computed } from "vue";

interface SortConfig<T> {
	key: keyof T;
	direction: "asc" | "desc";
}

interface UseDataSortOptions<T> {
	data: T[];
	initialSort?: SortConfig<T>;
}

export function useDataSort<T = any>(options: UseDataSortOptions<T>) {
	const { data, initialSort } = options;

	const sortConfigs = ref<SortConfig<T>[]>(initialSort ? [initialSort] : []);
	const isSorting = ref(false);

	const sortedData = computed(() => {
		if (sortConfigs.value.length === 0) return data;

		return [...data].sort((a, b) => {
			for (const config of sortConfigs.value) {
				const { key, direction } = config;
				const aValue = a[key];
				const bValue = b[key];

				if (aValue === bValue) continue;

				let comparison = 0;
				if (aValue < bValue) comparison = -1;
				if (aValue > bValue) comparison = 1;

				return direction === "desc" ? -comparison : comparison;
			}

			return 0;
		});
	});

	const addSort = (key: keyof T, direction: "asc" | "desc" = "asc") => {
		const existingIndex = sortConfigs.value.findIndex((c) => c.key === key);

		if (existingIndex >= 0) {
			sortConfigs.value[existingIndex].direction = direction;
		} else {
			sortConfigs.value.push({ key, direction });
		}
	};

	const removeSort = (key: keyof T) => {
		sortConfigs.value = sortConfigs.value.filter((c) => c.key !== key);
	};

	const toggleSort = (key: keyof T) => {
		const existing = sortConfigs.value.find((c) => c.key === key);

		if (existing) {
			existing.direction = existing.direction === "asc" ? "desc" : "asc";
		} else {
			sortConfigs.value.push({ key, direction: "asc" });
		}
	};

	const clearSort = () => {
		sortConfigs.value = [];
	};

	const moveSort = (fromIndex: number, toIndex: number) => {
		const item = sortConfigs.value.splice(fromIndex, 1)[0];
		sortConfigs.value.splice(toIndex, 0, item);
	};

	const getSortDirection = (key: keyof T): "asc" | "desc" | null => {
		const config = sortConfigs.value.find((c) => c.key === key);
		return config?.direction || null;
	};

	const hasSort = computed(() => sortConfigs.value.length > 0);

	return {
		sortConfigs,
		sortedData,
		isSorting,
		hasSort,
		addSort,
		removeSort,
		toggleSort,
		clearSort,
		moveSort,
		getSortDirection,
	};
}
