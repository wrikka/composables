import { onMounted, onUnmounted, ref } from "vue";

export interface UseOnClickOutsideOptions {
	ignore?: (string | HTMLElement)[];
	capture?: boolean;
}

export function useOnClickOutside(
	target: HTMLElement | (() => HTMLElement | null),
	callback: (event: MouseEvent) => void,
	options: UseOnClickOutsideOptions = {},
) {
	const { ignore = [], capture = true } = options;
	const isActive = ref(true);

	const shouldIgnore = (event: MouseEvent): boolean => {
		const targetElement = event.target as HTMLElement;

		// Check if clicked element is in ignore list
		for (const item of ignore) {
			if (typeof item === "string") {
				if (targetElement.closest(item)) return true;
			} else if (item?.contains(targetElement)) {
				return true;
			}
		}

		return false;
	};

	const handleClick = (event: MouseEvent) => {
		if (!isActive.value) return;
		if (shouldIgnore(event)) return;

		const targetElement = typeof target === "function" ? target() : target;
		if (!targetElement) return;

		if (!targetElement.contains(event.target as HTMLElement)) {
			callback(event);
		}
	};

	const activate = () => {
		isActive.value = true;
	};

	const deactivate = () => {
		isActive.value = false;
	};

	const stop = () => {
		document.removeEventListener("click", handleClick, { capture } as any);
	};

	// Initialize immediately so unit tests (without mounting) can still work
	document.addEventListener("click", handleClick, { capture });

	onMounted(() => {
		// no-op: already attached
	});

	onUnmounted(() => {
		stop();
	});

	return {
		isActive,
		activate,
		deactivate,
		stop,
	};
}
