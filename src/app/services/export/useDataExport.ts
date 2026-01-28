import { ref, computed } from "vue";

interface ExportOptions {
	format?: "csv" | "json" | "excel" | "pdf";
	filename?: string;
	headers?: string[];
	formatter?: (row: any) => any;
}

interface ExportState {
	isExporting: boolean;
	progress: number;
	error: Error | null;
}

export function useDataExport<T = any>() {
	const state = ref<ExportState>({
		isExporting: false,
		progress: 0,
		error: null,
	});

	const download = (content: string, filename: string, mimeType: string) => {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const exportToCSV = (data: T[], options: ExportOptions = {}): void => {
		const { filename = "export.csv", headers, formatter } = options;

		state.value.isExporting = true;
		state.value.progress = 0;

		try {
			const formattedData = formatter ? data.map(formatter) : data;
			const keys = headers || Object.keys(formattedData[0] || {});

			const csvContent = [
				keys.join(","),
				...formattedData.map((row) =>
					keys.map((key) => {
						const value = row[key];
						const stringValue =
							typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
						return stringValue;
					}),
				),
			]
				.map((row) => row.join(","))
				.join("\n");

			download(csvContent, filename, "text/csv;charset=utf-8;");
			state.value.progress = 100;
		} catch (error) {
			state.value.error = error as Error;
		} finally {
			state.value.isExporting = false;
		}
	};

	const exportToJSON = (data: T[], options: ExportOptions = {}): void => {
		const { filename = "export.json", formatter } = options;

		state.value.isExporting = true;
		state.value.progress = 0;

		try {
			const formattedData = formatter ? data.map(formatter) : data;
			const jsonContent = JSON.stringify(formattedData, null, 2);

			download(jsonContent, filename, "application/json");
			state.value.progress = 100;
		} catch (error) {
			state.value.error = error as Error;
		} finally {
			state.value.isExporting = false;
		}
	};

	const exportToExcel = (data: T[], options: ExportOptions = {}): void => {
		const { filename = "export.xlsx", headers, formatter } = options;

		state.value.isExporting = true;
		state.value.progress = 0;

		try {
			const formattedData = formatter ? data.map(formatter) : data;
			const keys = headers || Object.keys(formattedData[0] || {});

			const csvContent = [
				keys.join("\t"),
				...formattedData.map((row) =>
					keys.map((key) => {
						const value = row[key];
						const stringValue =
							typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
						return stringValue;
					}),
				),
			]
				.map((row) => row.join("\t"))
				.join("\n");

			download(csvContent, filename, "application/vnd.ms-excel");
			state.value.progress = 100;
		} catch (error) {
			state.value.error = error as Error;
		} finally {
			state.value.isExporting = false;
		}
	};

	const exportToPDF = (data: T[], options: ExportOptions = {}): void => {
		const { filename = "export.pdf" } = options;

		state.value.isExporting = true;
		state.value.progress = 0;

		try {
			const printWindow = window.open("", "_blank");
			if (printWindow) {
				printWindow.document.write(`
					<html>
						<head>
							<title>${filename}</title>
							<style>
								table { border-collapse: collapse; width: 100%; }
								th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
								th { background-color: #f2f2f2; }
							</style>
						</head>
						<body>
							<table>
								${data.map((row) => `
									<tr>
										${Object.values(row).map((value) => `<td>${value}</td>`).join("")}
									</tr>
								`).join("")}
							</table>
						</body>
					</html>
				`);
				printWindow.document.close();
				printWindow.print();
				printWindow.close();
			}
			state.value.progress = 100;
		} catch (error) {
			state.value.error = error as Error;
		} finally {
			state.value.isExporting = false;
		}
	};

	const exportData = (data: T[], options: ExportOptions = {}): void => {
		const { format = "csv" } = options;

		switch (format) {
			case "csv":
				exportToCSV(data, options);
				break;
			case "json":
				exportToJSON(data, options);
				break;
			case "excel":
				exportToExcel(data, options);
				break;
			case "pdf":
				exportToPDF(data, options);
				break;
		}
	};

	const isExporting = computed(() => state.value.isExporting);
	const progress = computed(() => state.value.progress);
	const error = computed(() => state.value.error);

	return {
		state,
		isExporting,
		progress,
		error,
		exportData,
		exportToCSV,
		exportToJSON,
		exportToExcel,
		exportToPDF,
	};
}
