import { ref, computed } from "vue";

interface ChangeRecord<T> {
	type: "create" | "update" | "delete";
	id: string;
	oldValue?: T;
	newValue?: T;
	timestamp: number;
	userId?: string;
}

interface UseDataHistoryOptions<T> {
	maxChanges?: number;
}

export function useDataHistory<T = any>(options: UseDataHistoryOptions<T> = {}) {
	const { maxChanges = 100 } = options;

	const changes = ref<ChangeRecord<T>[]>([]);

	const recordChange = (
		type: ChangeRecord<T>["type"],
		id: string,
		oldValue?: T,
		newValue?: T,
		userId?: string,
	) => {
		changes.value.push({
			type,
			id,
			oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
			newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
			timestamp: Date.now(),
			userId,
		});

		if (changes.value.length > maxChanges) {
			changes.value.shift();
		}
	};

	const getChanges = (id?: string) => {
		if (id) {
			return changes.value.filter((c) => c.id === id);
		}
		return changes.value;
	};

	const getLatestChange = (id: string): ChangeRecord<T> | undefined => {
		return changes.value.findLast((c) => c.id === id);
	};

	const getChangesByType = (type: ChangeRecord<T>["type"]) => {
		return changes.value.filter((c) => c.type === type);
	};

	const getChangesByUser = (userId: string) => {
		return changes.value.filter((c) => c.userId === userId);
	};

	const getChangesByTimeRange = (start: number, end: number) => {
		return changes.value.filter((c) => c.timestamp >= start && c.timestamp <= end);
	};

	const clear = () => {
		changes.value = [];
	};

	const clearForId = (id: string) => {
		changes.value = changes.value.filter((c) => c.id !== id);
	};

	const totalChanges = computed(() => changes.value.length);
	const changesByType = computed(() => ({
		create: changes.value.filter((c) => c.type === "create").length,
		update: changes.value.filter((c) => c.type === "update").length,
		delete: changes.value.filter((c) => c.type === "delete").length,
	}));

	return {
		changes,
		totalChanges,
		changesByType,
		recordChange,
		getChanges,
		getLatestChange,
		getChangesByType,
		getChangesByUser,
		getChangesByTimeRange,
		clear,
		clearForId,
	};
}
