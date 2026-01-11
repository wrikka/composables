import { onUnmounted, type Ref, unref, watch } from "vue";

export function useEventListener(
	target: Ref<EventTarget | null | undefined> | EventTarget,
	event: string,
	listener: EventListener,
	options?: boolean | AddEventListenerOptions,
) {
	const cleanup = () => {
		const targetEl = unref(target);
		if (targetEl) {
			targetEl.removeEventListener(event, listener, options);
		}
	};

	const stopWatch = watch(
		() => unref(target),
		(el) => {
			cleanup();
			if (el) {
				el.addEventListener(event, listener, options);
			}
		},
		{ immediate: true, flush: "post" },
	);

	const stop = () => {
		stopWatch();
		cleanup();
	};

	onUnmounted(stop);

	return stop;
}
