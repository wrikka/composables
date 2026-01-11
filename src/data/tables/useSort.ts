import type { Ref } from "vue";
import { computed, ref } from "vue";

type SortOrder = "asc" | "desc";

interface Sorter<T> {
	key: keyof T;
	order: SortOrder;
}

export function useSort<T extends Record<string, any>>(
	data: Ref<T[]>,
	initialSorter?: Sorter<T>,
) {
	const sortKey = ref(initialSorter?.key);
	const sortOrder = ref<SortOrder>(initialSorter?.order || "asc");

	const sortedData = computed(() => {
		if (!sortKey.value) {
			return data.value;
		}

		const key = sortKey.value;
		const order = sortOrder.value;

		return [...data.value].sort((a, b) => {
			const valueA = a[key];
			const valueB = b[key];

			if (valueA < valueB) {
				return order === "asc" ? -1 : 1;
			}
			if (valueA > valueB) {
				return order === "asc" ? 1 : -1;
			}
			return 0;
		});
	});

	function sortBy(key: keyof T) {
		if (sortKey.value === key) {
			sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
		} else {
			sortKey.value = key;
			sortOrder.value = "asc";
		}
	}

	return {
		sortKey,
		sortOrder,
		sortedData,
		sortBy,
	};
}
