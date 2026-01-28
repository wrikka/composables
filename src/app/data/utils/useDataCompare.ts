import { ref, computed } from "vue";

interface DiffResult<T> {
	key: string;
	oldValue: any;
	newValue: any;
	type: "added" | "removed" | "changed" | "unchanged";
}

interface UseDataCompareOptions<T> {
	deep?: boolean;
	ignoreKeys?: (keyof T)[];
}

export function useDataCompare<T = any>(options: UseDataCompareOptions<T> = {}) {
	const { deep = false, ignoreKeys = [] } = options;

	const compare = (oldData: T, newData: T): DiffResult<T>[] => {
		const diffs: DiffResult<T>[] = [];
		const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)]) as Set<keyof T>;

		keys.forEach((key) => {
			if (ignoreKeys.includes(key)) return;

			const oldValue = oldData[key];
			const newValue = newData[key];

			if (oldValue === undefined && newValue !== undefined) {
				diffs.push({ key: String(key), oldValue, newValue, type: "added" });
			} else if (oldValue !== undefined && newValue === undefined) {
				diffs.push({ key: String(key), oldValue, newValue, type: "removed" });
			} else if (oldValue !== newValue) {
				if (deep && typeof oldValue === "object" && typeof newValue === "object") {
					const nestedDiffs = compare(oldValue, newValue);
					nestedDiffs.forEach((diff) => {
						diffs.push({
							...diff,
							key: `${String(key)}.${diff.key}`,
						});
					});
				} else {
					diffs.push({ key: String(key), oldValue, newValue, type: "changed" });
				}
			}
		});

		return diffs;
	};

	const compareArrays = (oldArray: T[], newArray: T[]): DiffResult<T>[] => {
		const diffs: DiffResult<T>[] = [];

		oldArray.forEach((item, index) => {
			if (newArray[index] === undefined) {
				diffs.push({ key: String(index), oldValue: item, newValue: undefined, type: "removed" });
			} else if (JSON.stringify(item) !== JSON.stringify(newArray[index])) {
				diffs.push({ key: String(index), oldValue: item, newValue: newArray[index], type: "changed" });
			}
		});

		newArray.forEach((item, index) => {
			if (oldArray[index] === undefined) {
				diffs.push({ key: String(index), oldValue: undefined, newValue: item, type: "added" });
			}
		});

		return diffs;
	};

	const hasChanges = (oldData: T, newData: T): boolean => {
		return JSON.stringify(oldData) !== JSON.stringify(newData);
	};

	const getChangeCount = (oldData: T, newData: T): number => {
		return compare(oldData, newData).length;
	};

	return {
		compare,
		compareArrays,
		hasChanges,
		getChangeCount,
	};
}
