import { ref, computed } from "vue";

interface ImportOptions {
	format?: "csv" | "json" | "excel";
	validator?: (row: any) => boolean | string;
	transform?: (row: any) => any;
	skipInvalid?: boolean;
}

interface ImportState {
	isImporting: boolean;
	progress: number;
	error: Error | null;
	imported: number;
	failed: number;
}

export function useDataImport<T = any>() {
	const state = ref<ImportState>({
		isImporting: false,
		progress: 0,
		error: null,
		imported: 0,
		failed: 0,
	});

	const parseCSV = (content: string): any[] => {
		const lines = content.split("\n").filter((line) => line.trim());
		if (lines.length === 0) return [];

		const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
		const data: any[] = [];

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
			const row: any = {};
			headers.forEach((header, index) => {
				row[header] = values[index] || "";
			});
			data.push(row);
		}

		return data;
	};

	const parseJSON = (content: string): any[] => {
		try {
			return JSON.parse(content);
		} catch {
			return [];
		}
	};

	const parseExcel = (content: string): any[] => {
		const lines = content.split("\n").filter((line) => line.trim());
		if (lines.length === 0) return [];

		const headers = lines[0].split("\t").map((h) => h.trim().replace(/"/g, ""));
		const data: any[] = [];

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split("\t").map((v) => v.trim().replace(/"/g, ""));
			const row: any = {};
			headers.forEach((header, index) => {
				row[header] = values[index] || "";
			});
			data.push(row);
		}

		return data;
	};

	const importFromCSV = (
		file: File,
		options: ImportOptions = {},
	): Promise<T[]> => {
		return new Promise((resolve, reject) => {
			const { validator, transform, skipInvalid = true } = options;

			state.value.isImporting = true;
			state.value.progress = 0;
			state.value.imported = 0;
			state.value.failed = 0;

			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const content = e.target?.result as string;
					const data = parseCSV(content);
					const validData: T[] = [];

					data.forEach((row, index) => {
						const validation = validator ? validator(row) : true;
						const isValid = validation === true;

						if (isValid || skipInvalid) {
							const transformed = transform ? transform(row) : row;
							if (isValid) {
								validData.push(transformed);
								state.value.imported++;
							} else {
								state.value.failed++;
							}
						} else {
							state.value.failed++;
						}

						state.value.progress = Math.round(((index + 1) / data.length) * 100);
					});

					state.value.isImporting = false;
					resolve(validData);
				} catch (error) {
					state.value.isImporting = false;
					state.value.error = error as Error;
					reject(error);
				}
			};

			reader.onerror = () => {
				state.value.isImporting = false;
				state.value.error = new Error("Failed to read file");
				reject(new Error("Failed to read file"));
			};

			reader.readAsText(file);
		});
	};

	const importFromJSON = (
		file: File,
		options: ImportOptions = {},
	): Promise<T[]> => {
		return new Promise((resolve, reject) => {
			const { validator, transform, skipInvalid = true } = options;

			state.value.isImporting = true;
			state.value.progress = 0;
			state.value.imported = 0;
			state.value.failed = 0;

			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const content = e.target?.result as string;
					const data = parseJSON(content);
					const validData: T[] = [];

					data.forEach((row, index) => {
						const validation = validator ? validator(row) : true;
						const isValid = validation === true;

						if (isValid || skipInvalid) {
							const transformed = transform ? transform(row) : row;
							if (isValid) {
								validData.push(transformed);
								state.value.imported++;
							} else {
								state.value.failed++;
							}
						} else {
							state.value.failed++;
						}

						state.value.progress = Math.round(((index + 1) / data.length) * 100);
					});

					state.value.isImporting = false;
					resolve(validData);
				} catch (error) {
					state.value.isImporting = false;
					state.value.error = error as Error;
					reject(error);
				}
			};

			reader.onerror = () => {
				state.value.isImporting = false;
				state.value.error = new Error("Failed to read file");
				reject(new Error("Failed to read file"));
			};

			reader.readAsText(file);
		});
	};

	const importFromExcel = (
		file: File,
		options: ImportOptions = {},
	): Promise<T[]> => {
		return new Promise((resolve, reject) => {
			const { validator, transform, skipInvalid = true } = options;

			state.value.isImporting = true;
			state.value.progress = 0;
			state.value.imported = 0;
			state.value.failed = 0;

			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const content = e.target?.result as string;
					const data = parseExcel(content);
					const validData: T[] = [];

					data.forEach((row, index) => {
						const validation = validator ? validator(row) : true;
						const isValid = validation === true;

						if (isValid || skipInvalid) {
							const transformed = transform ? transform(row) : row;
							if (isValid) {
								validData.push(transformed);
								state.value.imported++;
							} else {
								state.value.failed++;
							}
						} else {
							state.value.failed++;
						}

						state.value.progress = Math.round(((index + 1) / data.length) * 100);
					});

					state.value.isImporting = false;
					resolve(validData);
				} catch (error) {
					state.value.isImporting = false;
					state.value.error = error as Error;
					reject(error);
				}
			};

			reader.onerror = () => {
				state.value.isImporting = false;
				state.value.error = new Error("Failed to read file");
				reject(new Error("Failed to read file"));
			};

			reader.readAsText(file);
		});
	};

	const importData = (
		file: File,
		options: ImportOptions = {},
	): Promise<T[]> => {
		const { format = "csv" } = options;

		switch (format) {
			case "csv":
				return importFromCSV(file, options);
			case "json":
				return importFromJSON(file, options);
			case "excel":
				return importFromExcel(file, options);
			default:
				return Promise.reject(new Error("Unsupported format"));
		}
	};

	const isImporting = computed(() => state.value.isImporting);
	const progress = computed(() => state.value.progress);
	const error = computed(() => state.value.error);
	const imported = computed(() => state.value.imported);
	const failed = computed(() => state.value.failed);

	return {
		state,
		isImporting,
		progress,
		error,
		imported,
		failed,
		importData,
		importFromCSV,
		importFromJSON,
		importFromExcel,
	};
}
