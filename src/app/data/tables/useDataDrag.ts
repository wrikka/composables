import { ref, computed } from "vue";

interface DragState<T> {
	type: "row" | "column";
	fromIndex: number;
	toIndex: number;
	data: T | null;
}

interface UseDataDragOptions<T> {
	data: T[];
	onDrop?: (fromIndex: number, toIndex: number) => void;
}

export function useDataDrag<T = any>(options: UseDataDragOptions<T>) {
	const { data, onDrop } = options;

	const isDragging = ref(false);
	const dragState = ref<DragState<T> | null>(null);
	const dragOverIndex = ref<number | null>(null);

	const startDrag = (index: number, type: "row" | "column" = "row") => {
		isDragging.value = true;
		dragState.value = {
			type,
			fromIndex: index,
			toIndex: index,
			data: data[index],
		};
	};

	const handleDragOver = (index: number) => {
		if (!isDragging.value) return;
		dragOverIndex.value = index;
		if (dragState.value) {
			dragState.value.toIndex = index;
		}
	};

	const handleDrop = () => {
		if (!dragState.value || !isDragging.value) return;

		const { fromIndex, toIndex } = dragState.value;

		if (fromIndex !== toIndex) {
			onDrop?.(fromIndex, toIndex);
		}

		isDragging.value = false;
		dragState.value = null;
		dragOverIndex.value = null;
	};

	const cancelDrag = () => {
		isDragging.value = false;
		dragState.value = null;
		dragOverIndex.value = null;
	};

	const getDropIndicator = (index: number): "before" | "after" | null => {
		if (!isDragging.value || dragOverIndex.value === null) return null;

		if (index === dragOverIndex.value) {
			return dragState.value?.fromIndex < index ? "after" : "before";
		}

		return null;
	};

	const isDragged = (index: number): boolean => {
		return dragState.value?.fromIndex === index;
	};

	return {
		isDragging,
		dragState,
		dragOverIndex,
		startDrag,
		handleDragOver,
		handleDrop,
		cancelDrag,
		getDropIndicator,
		isDragged,
	};
}
