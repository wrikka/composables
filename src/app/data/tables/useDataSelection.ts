import { ref, computed } from "vue";

interface SelectionMode {
	type: "single" | "multiple" | "checkbox";
}

interface UseDataSelectionOptions<T> {
	data: T[];
	mode?: SelectionMode["type"];
}

export function useDataSelection<T = any>(options: UseDataSelectionOptions<T>) {
	const { data, mode = "single" } = options;

	const selectedIds = ref<Set<string>>(new Set());
	const lastSelectedId = ref<string | null>(null);
	const isShiftPressed = ref(false);

	const selectedItems = computed(() => {
		return data.filter((item) => {
			const id = String((item as any).id || item);
			return selectedIds.value.has(id);
		});
	});

	const isSelected = (item: T): boolean => {
		const id = String((item as any).id || item);
		return selectedIds.value.has(id);
	};

	const select = (item: T) => {
		const id = String((item as any).id || item);

		if (mode === "single") {
			selectedIds.value.clear();
			selectedIds.value.add(id);
		} else if (mode === "multiple") {
			if (isShiftPressed.value && lastSelectedId.value) {
				const lastIndex = data.findIndex((d) => String((d as any).id || d) === lastSelectedId.value);
				const currentIndex = data.findIndex((d) => String((d as any).id || d) === id);

				if (lastIndex >= 0 && currentIndex >= 0) {
					const [start, end] = [Math.min(lastIndex, currentIndex), Math.max(lastIndex, currentIndex)];
					for (let i = start; i <= end; i++) {
						const itemId = String((data[i] as any).id || data[i]);
						selectedIds.value.add(itemId);
					}
				}
			} else {
				if (selectedIds.value.has(id)) {
					selectedIds.value.delete(id);
				} else {
					selectedIds.value.add(id);
				}
			}
		}

		lastSelectedId.value = id;
	};

	const selectAll = () => {
		selectedIds.value.clear();
		data.forEach((item) => {
			const id = String((item as any).id || item);
			selectedIds.value.add(id);
		});
	};

	const deselectAll = () => {
		selectedIds.value.clear();
		lastSelectedId.value = null;
	};

	const selectVisible = (visibleItems: T[]) => {
		selectedIds.value.clear();
		visibleItems.forEach((item) => {
			const id = String((item as any).id || item);
			selectedIds.value.add(id);
		});
	};

	const toggleSelection = (item: T) => {
		const id = String((item as any).id || item);

		if (mode === "single") {
			if (selectedIds.value.has(id)) {
				selectedIds.value.delete(id);
			} else {
				selectedIds.value.clear();
				selectedIds.value.add(id);
			}
		} else {
			if (selectedIds.value.has(id)) {
				selectedIds.value.delete(id);
			} else {
				selectedIds.value.add(id);
			}
		}

		lastSelectedId.value = id;
	};

	const selectionCount = computed(() => selectedIds.value.size);
	const isAllSelected = computed(() => selectionCount.value === data.length);
	const isSomeSelected = computed(() => selectionCount.value > 0 && selectionCount.value < data.length);

	return {
		selectedIds,
		selectedItems,
		lastSelectedId,
		selectionCount,
		isAllSelected,
		isSomeSelected,
		isSelected,
		select,
		selectAll,
		deselectAll,
		selectVisible,
		toggleSelection,
	};
}
