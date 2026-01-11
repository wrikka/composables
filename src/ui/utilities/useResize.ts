import { onMounted, onUnmounted, ref } from "vue";

export interface ResizeObserverEntry {
	target: Element;
	contentRect: DOMRectReadOnly;
	borderBoxSize?: ResizeObserverSize[];
	contentBoxSize?: ResizeObserverSize[];
	devicePixelContentBoxSize?: ResizeObserverSize[];
}

export interface UseResizeOptions {
	target?: HTMLElement | Window | Document;
	immediate?: boolean;
	onResize?: (entry: ResizeObserverEntry) => void;
}

export function useResize(options: UseResizeOptions = {}) {
	const { target = window, immediate = true, onResize } = options;

	const width = ref(0);
	const height = ref(0);
	const isSupported = ref(false);
	let resizeObserver: ResizeObserver | null = null;

	const updateSize = () => {
		if (target === window) {
			width.value = window.innerWidth;
			height.value = window.innerHeight;
		} else if (target === document) {
			width.value = document.documentElement.clientWidth;
			height.value = document.documentElement.clientHeight;
		} else if (target instanceof HTMLElement) {
			width.value = target.offsetWidth;
			height.value = target.offsetHeight;
		}
	};

	const handleResize = (entries: globalThis.ResizeObserverEntry[]) => {
		for (const entry of entries) {
			if (entry.target === target) {
				width.value = entry.contentRect.width;
				height.value = entry.contentRect.height;
				onResize?.(entry as ResizeObserverEntry);
				break;
			}
		}
	};

	const checkSupport = () => {
		isSupported.value = !!(window && "ResizeObserver" in window);
	};

	const observe = () => {
		if (!isSupported.value) return;

		if (target === window || target === document) {
			window.addEventListener("resize", updateSize);
			updateSize();
		} else if (target instanceof HTMLElement) {
			resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(target);
		}
	};

	const unobserve = () => {
		if (target === window || target === document) {
			window.removeEventListener("resize", updateSize);
		} else if (target instanceof HTMLElement && resizeObserver) {
			resizeObserver.unobserve(target);
			resizeObserver.disconnect();
			resizeObserver = null;
		}
	};

	onMounted(() => {
		checkSupport();

		if (immediate) {
			observe();
		}
	});

	onUnmounted(() => {
		unobserve();
	});

	return {
		width,
		height,
		isSupported,
		observe,
		unobserve,
		updateSize,
	};
}
