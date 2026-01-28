import { ref } from "vue";

interface UseFileDownloadOptions {
	fileName?: string;
}

export function useFileDownload() {
	const isDownloading = ref(false);
	const error = ref<any>(null);

	const download = async (
		url: string,
		options: UseFileDownloadOptions = {},
	) => {
		isDownloading.value = true;
		error.value = null;
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const blob = await response.blob();
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = options.fileName || url.split("/").pop() || "download";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(link.href);
		} catch (e) {
			error.value = e;
		} finally {
			isDownloading.value = false;
		}
	};

	return { isDownloading, error, download };
}
