import { ref, computed } from "vue";

interface MergeConflict<T> {
	key: string;
	value1: T;
	value2: T;
}

interface MergeResult<T> {
	data: T;
	conflicts: MergeConflict<T>[];
}

interface UseDataMergeOptions<T> {
	strategy?: "overwrite" | "preserve" | "merge" | "ask";
}

export function useDataMerge<T = any>(options: UseDataMergeOptions<T> = {}) {
	const { strategy = "overwrite" } = options;

	const merge = (data1: T, data2: T): MergeResult<T> => {
		const conflicts: MergeConflict<T>[] = [];
		const result = { ...data1 };

		Object.keys(data2).forEach((key) => {
			const value1 = data1[key as keyof T];
			const value2 = data2[key as keyof T];

			if (value1 !== undefined && value2 !== undefined && value1 !== value2) {
				switch (strategy) {
					case "overwrite":
						result[key as keyof T] = value2;
						break;
					case "preserve":
						break;
					case "merge":
						if (typeof value1 === "object" && typeof value2 === "object") {
							result[key as keyof T] = merge(value1, value2).data;
						} else {
							conflicts.push({ key, value1, value2 });
						}
						break;
					case "ask":
						conflicts.push({ key, value1, value2 });
						break;
				}
			} else if (value2 !== undefined) {
				result[key as keyof T] = value2;
			}
		});

		return { data: result, conflicts };
	};

	const mergeArrays = (array1: T[], array2: T[]): T[] => {
		const merged = [...array1];
		const existingKeys = new Set(array1.map((item) => String((item as any).id || item)));

		array2.forEach((item) => {
			const key = String((item as any).id || item);
			if (!existingKeys.has(key)) {
				merged.push(item);
				existingKeys.add(key);
			}
		});

		return merged;
	};

	const resolveConflict = (key: string, value: T): void => {
		// This would be implemented in the component
	};

	return {
		merge,
		mergeArrays,
		resolveConflict,
	};
}
