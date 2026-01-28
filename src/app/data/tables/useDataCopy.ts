import { ref, computed } from "vue";

interface CopyState {
	fromRow: number | null;
	fromColumn: string | null;
	toRow: number | null;
	toColumn: string | null;
	value: any;
}

interface UseDataCopyOptions<T> {
	data: T[];
	onPaste?: (rowIndex: number, columnKey: string, value: any) => void;
}

export function useDataCopy<T = any>(options: UseDataCopyOptions<T>) {
	const { data, onPaste } = options;

	const copyState = ref<CopyState>({
		fromRow: null,
		fromColumn: null,
		toRow: null,
		toColumn: null,
		value: null,
	});

	const isCopying = computed(() => copyState.value.fromRow !== null);

	const copyCell = (rowIndex: number, columnKey: string) => {
		copyState.value = {
			fromRow: rowIndex,
			fromColumn: columnKey,
			toRow: null,
			toColumn: null,
			value: data[rowIndex][columnKey as keyof T],
		};
	};

	const pasteCell = (rowIndex: number, columnKey: string) => {
		if (!isCopying.value) return;

		copyState.value.toRow = rowIndex;
		copyState.value.toColumn = columnKey;

		onPaste?.(rowIndex, columnKey, copyState.value.value);
	};

	const copyRow = (rowIndex: number) => {
		copyState.value = {
			fromRow: rowIndex,
			fromColumn: null,
			toRow: null,
			toColumn: null,
			value: data[rowIndex],
		};
	};

	const pasteRow = (rowIndex: number) => {
		if (!isCopying.value || copyState.value.fromColumn !== null) return;

		copyState.value.toRow = rowIndex;

		onPaste?.(rowIndex, "", copyState.value.value);
	};

	const clearCopy = () => {
		copyState.value = {
			fromRow: null,
			fromColumn: null,
			toRow: null,
			toColumn: null,
			value: null,
		};
	};

	const getCopiedValue = (): any => {
		return copyState.value.value;
	};

	const hasCopiedValue = computed(() => copyState.value.value !== null);

	return {
		copyState,
		isCopying,
		hasCopiedValue,
		copyCell,
		pasteCell,
		copyRow,
		pasteRow,
		clearCopy,
		getCopiedValue,
	};
}
