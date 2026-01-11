import { onMounted, onUnmounted, ref } from "vue";

export interface PageVisibilityOptions {
	onVisible?: () => void;
	onHidden?: () => void;
	onFocus?: () => void;
	onBlur?: () => void;
}

export function usePageVisibility(options: PageVisibilityOptions = {}) {
	const isVisible = ref(!document.hidden);
	const isFocused = ref(document.hasFocus?.() ?? true);

	const handleVisibilityChange = () => {
		isVisible.value = !document.hidden;

		if (isVisible.value) {
			options.onVisible?.();
		} else {
			options.onHidden?.();
		}
	};

	const handleFocus = () => {
		isFocused.value = true;
		options.onFocus?.();
	};

	const handleBlur = () => {
		isFocused.value = false;
		options.onBlur?.();
	};

	onMounted(() => {
		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("focus", handleFocus);
		window.addEventListener("blur", handleBlur);
	});

	onUnmounted(() => {
		document.removeEventListener("visibilitychange", handleVisibilityChange);
		window.removeEventListener("focus", handleFocus);
		window.removeEventListener("blur", handleBlur);
	});

	return {
		isVisible,
		isFocused,
	};
}
