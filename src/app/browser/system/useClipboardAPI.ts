import { ref } from "vue";

export interface ClipboardAPIOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

export function useClipboardAPI(options: ClipboardAPIOptions = {}) {
	const isSupported = ref(
		"clipboard" in navigator && "writeText" in navigator.clipboard,
	);
	const isLoading = ref(false);
	const error = ref<Error | null>(null);

	const copy = async (text: string): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = new Error("Clipboard API not supported");
			options.onError?.(error.value);
			return false;
		}

		if (isLoading.value) return false;

		isLoading.value = true;
		error.value = null;

		try {
			await navigator.clipboard.writeText(text);
			options.onSuccess?.();
			return true;
		} catch (err) {
			error.value = err as Error;
			options.onError?.(err as Error);
			return false;
		} finally {
			isLoading.value = false;
		}
	};

	const paste = async (): Promise<string | null> => {
		if (!isSupported.value) {
			error.value = new Error("Clipboard API not supported");
			options.onError?.(error.value);
			return null;
		}

		if (isLoading.value) return null;

		isLoading.value = true;
		error.value = null;

		try {
			const text = await navigator.clipboard.readText();
			return text;
		} catch (err) {
			error.value = err as Error;
			options.onError?.(err as Error);
			return null;
		} finally {
			isLoading.value = false;
		}
	};

	const copyHTML = async (html: string): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = new Error("Clipboard API not supported");
			options.onError?.(error.value);
			return false;
		}

		if (isLoading.value) return false;

		isLoading.value = true;
		error.value = null;

		try {
			const blob = new Blob([html], { type: "text/html" });
			const data = [new ClipboardItem({ "text/html": blob })];
			await navigator.clipboard.write(data);
			options.onSuccess?.();
			return true;
		} catch (err) {
			error.value = err as Error;
			options.onError?.(err as Error);
			return false;
		} finally {
			isLoading.value = false;
		}
	};

	const copyImage = async (imageData: Blob): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = new Error("Clipboard API not supported");
			options.onError?.(error.value);
			return false;
		}

		if (isLoading.value) return false;

		isLoading.value = true;
		error.value = null;

		try {
			const data = [new ClipboardItem({ "image/png": imageData })];
			await navigator.clipboard.write(data);
			options.onSuccess?.();
			return true;
		} catch (err) {
			error.value = err as Error;
			options.onError?.(err as Error);
			return false;
		} finally {
			isLoading.value = false;
		}
	};

	const clear = async (): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = new Error("Clipboard API not supported");
			options.onError?.(error.value);
			return false;
		}

		if (isLoading.value) return false;

		isLoading.value = true;
		error.value = null;

		try {
			await navigator.clipboard.writeText("");
			options.onSuccess?.();
			return true;
		} catch (err) {
			error.value = err as Error;
			options.onError?.(err as Error);
			return false;
		} finally {
			isLoading.value = false;
		}
	};

	return {
		isSupported,
		isLoading,
		error,
		copy,
		paste,
		copyHTML,
		copyImage,
		clear,
	};
}
