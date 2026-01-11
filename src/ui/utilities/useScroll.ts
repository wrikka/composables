import { onMounted, onUnmounted, ref } from "vue";

export interface ScrollPosition {
	x: number;
	y: number;
}

export interface UseScrollOptions {
	target?: Window | HTMLElement;
	throttle?: number;
	offset?: number;
	onScroll?: (position: ScrollPosition) => void;
}

export function useScroll(options: UseScrollOptions = {}) {
	const {
		target = window,
		throttle: throttleMs = 0,
		offset = 0,
		onScroll,
	} = options;

	const x = ref(0);
	const y = ref(0);
	const isScrolling = ref(false);
	const arrivedState = ref({
		top: true,
		bottom: false,
		left: true,
		right: false,
	});
	const directions = ref({
		top: false,
		bottom: false,
		left: false,
		right: false,
	});

	let lastScrollTime = 0;
	const timeoutId: NodeJS.Timeout | null = null;
	let scrollTimeoutId: NodeJS.Timeout | null = null;

	const isElement = (el: any): el is HTMLElement => {
		return el && el.nodeType === 1;
	};

	const getScrollPosition = (): ScrollPosition => {
		if (isElement(target)) {
			return {
				x: target.scrollLeft,
				y: target.scrollTop,
			};
		} else {
			return {
				x: target.scrollX,
				y: target.scrollY,
			};
		}
	};

	const getMaxScroll = (): ScrollPosition => {
		if (isElement(target)) {
			return {
				x: target.scrollWidth - target.clientWidth,
				y: target.scrollHeight - target.clientHeight,
			};
		} else {
			return {
				x: document.documentElement.scrollWidth - window.innerWidth,
				y: document.documentElement.scrollHeight - window.innerHeight,
			};
		}
	};

	const updateScrollState = () => {
		const position = getScrollPosition();
		const maxScroll = getMaxScroll();

		x.value = position.x;
		y.value = position.y;

		const isTop = position.y <= offset;
		const isBottom = position.y >= maxScroll.y - offset;
		const isLeft = position.x <= offset;
		const isRight = position.x >= maxScroll.x - offset;

		arrivedState.value = {
			top: isTop,
			bottom: isBottom,
			left: isLeft,
			right: isRight,
		};

		directions.value = {
			top: position.y < y.value,
			bottom: position.y > y.value,
			left: position.x < x.value,
			right: position.x > x.value,
		};

		isScrolling.value = true;

		if (scrollTimeoutId) {
			clearTimeout(scrollTimeoutId);
		}

		scrollTimeoutId = setTimeout(() => {
			isScrolling.value = false;
		}, 100);

		onScroll?.(position);
	};

	const scrollTo = (
		options?:
			| ScrollToOptions
			| { x?: number; y?: number; behavior?: ScrollBehavior },
	) => {
		if (isElement(target)) {
			if (options && "x" in options) {
				target.scrollTo({
					left: options.x,
					top: options.y ?? 0,
					behavior: options.behavior || "auto",
				});
			} else {
				target.scrollTo(options as ScrollToOptions);
			}
		} else {
			if (options && "x" in options) {
				target.scrollTo({
					left: options.x,
					top: options.y ?? 0,
					behavior: options.behavior || "auto",
				});
			} else {
				target.scrollTo(options as ScrollToOptions);
			}
		}
	};

	const scrollToTop = (behavior: ScrollBehavior = "smooth") => {
		scrollTo({ y: 0, behavior });
	};

	const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
		const maxScroll = getMaxScroll();
		scrollTo({ y: maxScroll.y, behavior });
	};

	const scrollToLeft = (behavior: ScrollBehavior = "smooth") => {
		scrollTo({ x: 0, behavior });
	};

	const scrollToRight = (behavior: ScrollBehavior = "smooth") => {
		const maxScroll = getMaxScroll();
		scrollTo({ x: maxScroll.x, behavior });
	};

	const scrollBy = (
		options?:
			| ScrollToOptions
			| { x?: number; y?: number; behavior?: ScrollBehavior },
	) => {
		if (isElement(target)) {
			if (options && "x" in options) {
				target.scrollBy({
					left: options.x,
					top: options.y ?? 0,
					behavior: options.behavior || "auto",
				});
			} else {
				target.scrollBy(options as ScrollToOptions);
			}
		} else {
			if (options && "x" in options) {
				target.scrollBy({
					left: options.x,
					top: options.y ?? 0,
					behavior: options.behavior || "auto",
				});
			} else {
				target.scrollBy(options as ScrollToOptions);
			}
		}
	};

	const handleScroll = () => {
		const now = Date.now();

		if (throttleMs > 0) {
			if (now - lastScrollTime >= throttleMs) {
				updateScrollState();
				lastScrollTime = now;
			}
		} else {
			updateScrollState();
		}
	};

	onMounted(() => {
		updateScrollState();
		target.addEventListener("scroll", handleScroll, { passive: true });
	});

	onUnmounted(() => {
		target.removeEventListener("scroll", handleScroll);
		if (timeoutId) clearTimeout(timeoutId);
		if (scrollTimeoutId) clearTimeout(scrollTimeoutId);
	});

	return {
		x,
		y,
		isScrolling,
		arrivedState,
		directions,
		scrollTo,
		scrollToTop,
		scrollToBottom,
		scrollToLeft,
		scrollToRight,
		scrollBy,
		updateScrollState,
	};
}
