import { onMounted, onUnmounted, ref } from "vue";

export interface UsePreferredDarkOptions {
	defaultValue?: boolean;
	window?: Window;
}

export function usePreferredDark(options: UsePreferredDarkOptions = {}) {
	const { defaultValue = false, window: targetWindow = window } = options;

	const isDark = ref(defaultValue);
	const isSupported = ref(false);

	const update = () => {
		if (targetWindow.matchMedia) {
			const mediaQuery = targetWindow.matchMedia(
				"(prefers-color-scheme: dark)",
			);
			isDark.value = mediaQuery.matches;
		}
	};

	const checkSupport = () => {
		isSupported.value = !!targetWindow.matchMedia;
	};

	onMounted(() => {
		checkSupport();
		update();

		if (targetWindow.matchMedia) {
			const mediaQuery = targetWindow.matchMedia(
				"(prefers-color-scheme: dark)",
			);

			if (mediaQuery.addEventListener) {
				mediaQuery.addEventListener("change", update);
			} else if ((mediaQuery as any).addListener) {
				(mediaQuery as any).addListener(update);
			}
		}
	});

	onUnmounted(() => {
		if (targetWindow.matchMedia) {
			const mediaQuery = targetWindow.matchMedia(
				"(prefers-color-scheme: dark)",
			);

			if (mediaQuery.removeEventListener) {
				mediaQuery.removeEventListener("change", update);
			} else if ((mediaQuery as any).removeListener) {
				(mediaQuery as any).removeListener(update);
			}
		}
	});

	return {
		isDark,
		isSupported,
	};
}
