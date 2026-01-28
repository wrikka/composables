import { ref, computed } from "vue";

interface ColumnConfig {
	key: string;
	visible?: boolean;
	width?: string;
	frozen?: boolean;
	position?: number;
}

interface UseDataColumnOptions {
	initialColumns?: ColumnConfig[];
}

export function useDataColumn(options: UseDataColumnOptions = {}) {
	const { initialColumns = [] } = options;

	const columns = ref<ColumnConfig[]>([...initialColumns]);
	const hiddenColumns = ref<Set<string>>(new Set());
	const frozenColumns = ref<Set<string>>(new Set());

	const visibleColumns = computed(() =>
		columns.value.filter((col) => !hiddenColumns.value.has(col.key)),
	);

	const showColumn = (key: string) => {
		hiddenColumns.value.delete(key);
	};

	const hideColumn = (key: string) => {
		hiddenColumns.value.add(key);
	};

	const toggleColumn = (key: string) => {
		if (hiddenColumns.value.has(key)) {
			hiddenColumns.value.delete(key);
		} else {
			hiddenColumns.value.add(key);
		}
	};

	const freezeColumn = (key: string) => {
		frozenColumns.value.add(key);
	};

	const unfreezeColumn = (key: string) => {
		frozenColumns.value.delete(key);
	};

	const moveColumn = (fromIndex: number, toIndex: number) => {
		const [moved] = columns.value.splice(fromIndex, 1);
		columns.value.splice(toIndex, 0, moved);

		columns.value.forEach((col, index) => {
			col.position = index;
		});
	};

	const setColumnWidth = (key: string, width: string) => {
		const column = columns.value.find((col) => col.key === key);
		if (column) {
			column.width = width;
		}
	};

	const resetColumns = () => {
		columns.value = [...initialColumns];
		hiddenColumns.value.clear();
		frozenColumns.value.clear();
	};

	const isColumnVisible = (key: string) => !hiddenColumns.value.has(key);
	const isColumnFrozen = (key: string) => frozenColumns.value.has(key);

	return {
		columns,
		hiddenColumns,
		frozenColumns,
		visibleColumns,
		showColumn,
		hideColumn,
		toggleColumn,
		freezeColumn,
		unfreezeColumn,
		moveColumn,
		setColumnWidth,
		resetColumns,
		isColumnVisible,
		isColumnFrozen,
	};
}
