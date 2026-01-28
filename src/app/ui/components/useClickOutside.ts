import { type Ref, unref } from "vue";
import { useEventListener } from "./useEventListener";

export function useClickOutside(
	target: Ref<HTMLElement | null | undefined> | HTMLElement,
	handler: (evt: MouseEvent) => void,
) {
	const listener = (event: MouseEvent) => {
		const targetEl = unref(target);
		if (!targetEl || targetEl.contains(event.target as Node)) {
			return;
		}
		handler(event);
	};

	return useEventListener(window, "click", listener as EventListener);
}
