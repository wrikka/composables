import { ref } from "vue";

export interface ShareData {
	title?: string;
	text?: string;
	url?: string;
	files?: File[];
}

export interface ShareOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

export function useShare(options: ShareOptions = {}) {
	const isSupported = ref("share" in navigator);
	const isLoading = ref(false);
	const error = ref<Error | null>(null);

	const share = async (data: ShareData): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = new Error("Web Share API not supported");
			options.onError?.(error.value);
			return false;
		}

		if (isLoading.value) return false;

		isLoading.value = true;
		error.value = null;

		try {
			await navigator.share(data);
			options.onSuccess?.();
			return true;
		} catch (err) {
			// User cancelled sharing is not an error
			if ((err as Error).name === "AbortError") {
				return false;
			}

			error.value = err as Error;
			options.onError?.(err as Error);
			return false;
		} finally {
			isLoading.value = false;
		}
	};

	const shareText = async (text: string, title?: string): Promise<boolean> => {
		const data: ShareData = { text };
		if (title !== undefined) data.title = title;
		return await share(data);
	};

	const shareUrl = async (
		url: string,
		title?: string,
		text?: string,
	): Promise<boolean> => {
		const data: ShareData = { url };
		if (title !== undefined) data.title = title;
		if (text !== undefined) data.text = text;
		return await share(data);
	};

	const shareFile = async (
		files: File[],
		title?: string,
		text?: string,
	): Promise<boolean> => {
		const data: ShareData = { files };
		if (title !== undefined) data.title = title;
		if (text !== undefined) data.text = text;
		return await share(data);
	};

	const canShare = (data: Partial<ShareData> = {}): boolean => {
		if (!isSupported.value) return false;

		try {
			return navigator.canShare?.(data) ?? true;
		} catch {
			return true;
		}
	};

	return {
		isSupported,
		isLoading,
		error,
		share,
		shareText,
		shareUrl,
		shareFile,
		canShare,
	};
}
