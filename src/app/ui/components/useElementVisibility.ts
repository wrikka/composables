import { onMounted, onUnmounted, type Ref, ref } from "vue";

export function useElementVisibility(
	element: Ref<HTMLElement | null>,
): Ref<boolean> {
	const isVisible = ref(false);

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry) {
				isVisible.value = entry.isIntersecting;
			}
		},
		{ threshold: 0.1 },
	);

	onMounted(() => {
		if (element.value) {
			observer.observe(element.value);
		}
	});

	onUnmounted(() => {
		observer.disconnect();
	});

	return isVisible;
}
