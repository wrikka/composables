import { ref, computed } from "vue";

type CellEditorType = "text" | "number" | "select" | "date" | "boolean" | "custom";

interface CellEditor<T> {
	type: CellEditorType;
	options?: string[];
	validate?: (value: any) => boolean | string;
	onSave?: (value: any) => void;
}

interface EditState<T> {
	rowIndex: number;
	columnKey: string;
	value: any;
}

interface UseDataEditOptions<T> {
	data: T[];
	editors?: Record<string, CellEditor<T>>;
}

export function useDataEdit<T = any>(options: UseDataEditOptions<T>) {
	const { data, editors = {} } = options;

	const isEditing = ref(false);
	const editState = ref<EditState<T> | null>(null);
	const error = ref<string | null>(null);

	const startEdit = (rowIndex: number, columnKey: string) => {
		editState.value = {
			rowIndex,
			columnKey,
			value: data[rowIndex][columnKey as keyof T],
		};
		isEditing.value = true;
		error.value = null;
	};

	const cancelEdit = () => {
		editState.value = null;
		isEditing.value = false;
		error.value = null;
	};

	const saveEdit = () => {
		if (!editState.value) return;

		const { rowIndex, columnKey, value } = editState.value;
		const editor = editors[columnKey];

		if (editor?.validate) {
			const validation = editor.validate(value);
			if (validation !== true) {
				error.value = typeof validation === "string" ? validation : "Invalid value";
				return;
			}
		}

		editor?.onSave?.(value);
		cancelEdit();
	};

	const updateValue = (value: any) => {
		if (editState.value) {
			editState.value.value = value;
		}
	};

	const getEditor = (columnKey: string): CellEditor<T> | undefined => {
		return editors[columnKey];
	};

	const isCellEditing = (rowIndex: number, columnKey: string): boolean => {
		return (
			isEditing.value &&
			editState.value?.rowIndex === rowIndex &&
			editState.value?.columnKey === columnKey
		);
	};

	const getCellValue = (rowIndex: number, columnKey: string): any => {
		if (isCellEditing(rowIndex, columnKey) && editState.value) {
			return editState.value.value;
		}
		return data[rowIndex][columnKey as keyof T];
	};

	return {
		isEditing,
		editState,
		error,
		startEdit,
		cancelEdit,
		saveEdit,
		updateValue,
		getEditor,
		isCellEditing,
		getCellValue,
	};
}
