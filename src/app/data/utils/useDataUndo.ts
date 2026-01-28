import { ref, computed } from "vue";

interface HistoryEntry<T> {
	data: T;
	timestamp: number;
	description?: string;
}

interface UseDataUndoOptions<T> {
	maxHistory?: number;
}

export function useDataUndo<T = any>(options: UseDataUndoOptions<T> = {}) {
	const { maxHistory = 50 } = options;

	const history = ref<HistoryEntry<T>[]>([]);
	const currentIndex = ref(-1);

	const canUndo = computed(() => currentIndex.value > 0);
	const canRedo = computed(() => currentIndex.value < history.value.length - 1);

	const push = (data: T, description?: string) => {
		if (currentIndex.value < history.value.length - 1) {
			history.value = history.value.slice(0, currentIndex.value + 1);
		}

		history.value.push({
			data: JSON.parse(JSON.stringify(data)),
			timestamp: Date.now(),
			description,
		});

		if (history.value.length > maxHistory) {
			history.value.shift();
		}

		currentIndex.value = history.value.length - 1;
	};

	const undo = (): T | null => {
		if (!canUndo.value) return null;

		currentIndex.value--;
		return JSON.parse(JSON.stringify(history.value[currentIndex.value].data));
	};

	const redo = (): T | null => {
		if (!canRedo.value) return null;

		currentIndex.value++;
		return JSON.parse(JSON.stringify(history.value[currentIndex.value].data));
	};

	const getCurrent = (): T | null => {
		if (currentIndex.value < 0 || currentIndex.value >= history.value.length) return null;
		return JSON.parse(JSON.stringify(history.value[currentIndex.value].data));
	};

	const clear = () => {
		history.value = [];
		currentIndex.value = -1;
	};

	const getHistory = () => history.value.map((entry) => ({
		...entry,
		data: JSON.parse(JSON.stringify(entry.data)),
	}));

	return {
		history,
		currentIndex,
		canUndo,
		canRedo,
		push,
		undo,
		redo,
		getCurrent,
		clear,
		getHistory,
	};
}
