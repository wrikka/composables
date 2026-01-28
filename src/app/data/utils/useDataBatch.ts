import { ref, computed } from "vue";

interface BatchOperation<T> {
	type: "update" | "delete" | "export";
	items: T[];
	onProgress?: (progress: number) => void;
}

interface UseDataBatchOptions<T> {
	batchSize?: number;
}

export function useDataBatch<T = any>(options: UseDataBatchOptions<T> = {}) {
	const { batchSize = 100 } = options;

	const isProcessing = ref(false);
	const progress = ref(0);
	const error = ref<Error | null>(null);

	const processBatch = async <R>(
		items: T[],
		operation: (item: T) => Promise<R>,
	): Promise<R[]> => {
		isProcessing.value = true;
		progress.value = 0;
		error.value = null;

		const results: R[] = [];
		const total = items.length;

		for (let i = 0; i < total; i += batchSize) {
			const batch = items.slice(i, i + batchSize);

			try {
				const batchResults = await Promise.all(batch.map(operation));
				results.push(...batchResults);
			} catch (e) {
				error.value = e as Error;
				break;
			}

			progress.value = Math.min(100, Math.round(((i + batchSize) / total) * 100));
		}

		isProcessing.value = false;
		return results;
	};

	const bulkUpdate = async <R>(
		items: T[],
		updateFn: (item: T) => Promise<R>,
	): Promise<R[]> => {
		return processBatch(items, updateFn);
	};

	const bulkDelete = async <R>(
		items: T[],
		deleteFn: (item: T) => Promise<R>,
	): Promise<R[]> => {
		return processBatch(items, deleteFn);
	};

	const bulkExport = async <R>(
		items: T[],
		exportFn: (item: T) => Promise<R>,
	): Promise<R[]> => {
		return processBatch(items, exportFn);
	};

	const executeBatch = async <R>(
		operation: BatchOperation<T>,
		handler: (item: T) => Promise<R>,
	): Promise<R[]> => {
		const { items, onProgress } = operation;

		isProcessing.value = true;
		progress.value = 0;
		error.value = null;

		const results: R[] = [];
		const total = items.length;

		for (let i = 0; i < total; i += batchSize) {
			const batch = items.slice(i, i + batchSize);

			try {
				const batchResults = await Promise.all(batch.map(handler));
				results.push(...batchResults);
			} catch (e) {
				error.value = e as Error;
				break;
			}

			progress.value = Math.min(100, Math.round(((i + batchSize) / total) * 100));
			onProgress?.(progress.value);
		}

		isProcessing.value = false;
		return results;
	};

	return {
		isProcessing,
		progress,
		error,
		processBatch,
		bulkUpdate,
		bulkDelete,
		bulkExport,
		executeBatch,
	};
}
