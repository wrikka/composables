import { ref } from "vue";

export interface ClipboardOptions {
	legacy?: boolean;
	timeout?: number;
}

export function useClipboard(options: ClipboardOptions = {}) {
	const { legacy = true, timeout = 2000 } = options;

	const isSupported = ref(!!navigator.clipboard);
	const text = ref("");
	const copied = ref(false);
	const error = ref<string | null>(null);

	let timeoutId: NodeJS.Timeout | null = null;

	const copy = async (value: string): Promise<boolean> => {
		try {
			error.value = null;

			if (isSupported.value && !legacy) {
				// Use modern Clipboard API
				await navigator.clipboard.writeText(value);
				text.value = value;
				copied.value = true;
				setCopiedTimeout();
				return true;
			} else {
				// Fallback to legacy method
				return legacyCopy(value);
			}
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to copy";
			copied.value = false;
			return false;
		}
	};

	const legacyCopy = (value: string): boolean => {
		try {
			const textArea = document.createElement("textarea");
			textArea.value = value;
			textArea.style.position = "fixed";
			textArea.style.left = "-999999px";
			textArea.style.top = "-999999px";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			const successful = document.execCommand("copy");
			document.body.removeChild(textArea);

			if (successful) {
				text.value = value;
				copied.value = true;
				setCopiedTimeout();
				return true;
			} else {
				error.value = "Copy command failed";
				return false;
			}
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to copy";
			return false;
		}
	};

	const cut = async (): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = "Cut operation not supported";
			return false;
		}

		try {
			const selectedText = await getSelectedText();
			await navigator.clipboard.writeText(selectedText);

			// Clear selection
			document.getSelection()?.removeAllRanges();

			text.value = selectedText;
			copied.value = true;
			setCopiedTimeout();
			return true;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to cut";
			return false;
		}
	};

	const paste = async (): Promise<string> => {
		if (!isSupported.value) {
			error.value = "Paste operation not supported";
			return "";
		}

		try {
			const clipboardText = await navigator.clipboard.readText();
			text.value = clipboardText;
			return clipboardText;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to paste";
			return "";
		}
	};

	const read = async (): Promise<string> => {
		return paste();
	};

	const write = async (value: string): Promise<boolean> => {
		return copy(value);
	};

	const clear = (): void => {
		text.value = "";
		copied.value = false;
		error.value = null;

		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	const setCopiedTimeout = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			copied.value = false;
			timeoutId = null;
		}, timeout);
	};

	const getSelectedText = (): string => {
		const selection = document.getSelection();
		return selection ? selection.toString() : "";
	};

	const selectAll = (): void => {
		const selection = document.getSelection();
		if (selection) {
			selection.selectAllChildren(document.body);
		}
	};

	const copyElement = async (element: Element): Promise<boolean> => {
		try {
			const textToCopy =
				element.textContent || (element as HTMLElement).innerText || "";
			return copy(textToCopy);
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : "Failed to copy element content";
			return false;
		}
	};

	const copyElementValue = async (
		element: HTMLInputElement | HTMLTextAreaElement,
	): Promise<boolean> => {
		try {
			return copy(element.value);
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : "Failed to copy element value";
			return false;
		}
	};

	const copyHTML = async (html: string): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = "HTML copy not supported";
			return false;
		}

		try {
			const blob = new Blob([html], { type: "text/html" });
			const data = [new ClipboardItem({ "text/html": blob })];
			await navigator.clipboard.write(data);
			copied.value = true;
			setCopiedTimeout();
			return true;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to copy HTML";
			return false;
		}
	};

	const copyRichText = async (
		textContent: string,
		html: string,
	): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = "Rich text copy not supported";
			return false;
		}

		try {
			const textBlob = new Blob([textContent], { type: "text/plain" });
			const htmlBlob = new Blob([html], { type: "text/html" });
			const data = [
				new ClipboardItem({
					"text/plain": textBlob,
					"text/html": htmlBlob,
				}),
			];
			await navigator.clipboard.write(data);
			text.value = textContent;
			copied.value = true;
			setCopiedTimeout();
			return true;
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : "Failed to copy rich text";
			return false;
		}
	};

	const requestPermission = async (): Promise<boolean> => {
		if (!navigator.permissions) {
			return true; // Permissions API not available
		}

		try {
			const permission = await navigator.permissions.query({
				name: "clipboard-write" as PermissionName,
			});
			return permission.state === "granted" || permission.state === "prompt";
		} catch {
			return true; // Permission check failed, assume it's available
		}
	};

	return {
		isSupported,
		text,
		copied,
		error,
		copy,
		cut,
		paste,
		read,
		write,
		clear,
		getSelectedText,
		selectAll,
		copyElement,
		copyElementValue,
		copyHTML,
		copyRichText,
		requestPermission,
	};
}
