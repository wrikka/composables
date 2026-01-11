import { onMounted, onUnmounted, ref } from "vue";

export function useMediaQuery(query: string) {
	const matches = ref(false);

	let mediaQuery: MediaQueryList | null = null;

	const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
		matches.value = e.matches;
	};

	onMounted(() => {
		if (typeof window !== "undefined" && window.matchMedia) {
			mediaQuery = window.matchMedia(query);
			matches.value = mediaQuery.matches;

			// Use addEventListener for modern browsers, fallback to addListener for older ones
			if (mediaQuery.addEventListener) {
				mediaQuery.addEventListener("change", updateMatches);
			} else {
				mediaQuery.addListener(updateMatches);
			}
		}
	});

	onUnmounted(() => {
		if (mediaQuery) {
			if (mediaQuery.removeEventListener) {
				mediaQuery.removeEventListener("change", updateMatches);
			} else {
				mediaQuery.removeListener(updateMatches);
			}
		}
	});

	return {
		matches,
	};
}
