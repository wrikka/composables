import type { Ref } from "vue";
import { ref } from "vue";

interface ExportOptions {
	filename?: string;
	delimiter?: string;
	headers?: string[];
}

export function useExport<T extends Record<string, any>>(data: Ref<T[]>) {
	const isExporting = ref(false);

	function exportToCSV(options: ExportOptions = {}) {
		isExporting.value = true;
		try {
			const { filename = "export.csv", delimiter = ",", headers } = options;
			const dataToExport = data.value;

			if (dataToExport.length === 0) return;

			const columnHeaders = headers || Object.keys(dataToExport[0]!);
			const csvContent = [
				columnHeaders.join(delimiter),
				...dataToExport.map((item) =>
					columnHeaders
						.map((header) => {
							const value = item[header as keyof T];
							if (typeof value === "string" && value.includes(delimiter)) {
								return `"${value}"`;
							}
							return value;
						})
						.join(delimiter),
				),
			].join("\n");

			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", filename);
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} finally {
			isExporting.value = false;
		}
	}

	return {
		isExporting,
		exportToCSV,
	};
}
