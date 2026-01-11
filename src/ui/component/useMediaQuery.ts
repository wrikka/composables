import { onMounted, onUnmounted, type Ref, ref } from "vue";

export function useMediaQuery(query: string): Ref<boolean> {
	const matches = ref(false);

	if (typeof window !== "undefined") {
		const mediaQueryList = window.matchMedia(query);
		matches.value = mediaQueryList.matches;

		const listener = (event: MediaQueryListEvent) => {
			matches.value = event.matches;
		};

		onMounted(() => {
			mediaQueryList.addEventListener("change", listener);
		});

		onUnmounted(() => {
			mediaQueryList.removeEventListener("change", listener);
		});
	}

	return matches;
}
