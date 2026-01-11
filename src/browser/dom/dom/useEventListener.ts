import { onMounted, onUnmounted, type Ref, unref } from "vue";

type Target = Ref<EventTarget | null> | EventTarget;

export function useEventListener(
	target: Target,
	event: string,
	handler: (e: Event) => void,
) {
	onMounted(() => {
		const targetElement = unref(target);
		if (targetElement) {
			targetElement.addEventListener(event, handler);
		}
	});

	onUnmounted(() => {
		const targetElement = unref(target);
		if (targetElement) {
			targetElement.removeEventListener(event, handler);
		}
	});
}
