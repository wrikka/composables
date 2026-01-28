import { ref } from "vue";

export interface UseCopyToClipboardOptions {
	timeout?: number;
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
	const { timeout = 2000 } = options;

	const isSupported = ref(!!navigator.clipboard);
	const isCopied = ref(false);
	const error = ref<string | null>(null);

	const copy = async (text: string): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = "Clipboard API is not supported";
			return false;
		}

		try {
			await navigator.clipboard.writeText(text);
			isCopied.value = true;
			error.value = null;

			// Reset isCopied after timeout
			setTimeout(() => {
				isCopied.value = false;
			}, timeout);

			return true;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to copy";
			isCopied.value = false;
			return false;
		}
	};

	const copyLegacy = (text: string): boolean => {
		try {
			const textArea = document.createElement("textarea");
			textArea.value = text;
			textArea.style.position = "fixed";
			textArea.style.left = "-999999px";
			textArea.style.top = "-999999px";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			const successful = document.execCommand("copy");
			document.body.removeChild(textArea);

			if (successful) {
				isCopied.value = true;
				error.value = null;
				setTimeout(() => {
					isCopied.value = false;
				}, timeout);
			} else {
				error.value = "Failed to copy using legacy method";
			}

			return successful;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to copy";
			isCopied.value = false;
			return false;
		}
	};

	const paste = async (): Promise<string | null> => {
		if (!isSupported.value) {
			error.value = "Clipboard API is not supported";
			return null;
		}

		try {
			const text = await navigator.clipboard.readText();
			error.value = null;
			return text;
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : "Failed to read clipboard";
			return null;
		}
	};

	const clear = async (): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = "Clipboard API is not supported";
			return false;
		}

		try {
			await navigator.clipboard.writeText("");
			error.value = null;
			return true;
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : "Failed to clear clipboard";
			return false;
		}
	};

	return {
		isSupported,
		isCopied,
		error,
		copy,
		copyLegacy,
		paste,
		clear,
	};
}
