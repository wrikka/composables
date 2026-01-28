import { ref, computed, onMounted, onUnmounted } from "vue";

interface VirtualScrollOptions {
	itemHeight: number;
	overscan?: number;
	scrollContainer?: HTMLElement | Window;
}

interface VirtualScrollState {
	visibleStart: number;
	visibleEnd: number;
	scrollTop: number;
}

export function useDataVirtual<T = any>(data: T[], options: VirtualScrollOptions) {
	const { itemHeight, overscan = 5, scrollContainer } = options;

	const scrollTop = ref(0);
	const containerHeight = ref(0);
	const isScrolling = ref(false);
	const scrollTimeout = ref<number | null>(null);

	const visibleStart = computed(() => Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan));
	const visibleEnd = computed(() =>
		Math.min(data.length, Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + overscan),
	);

	const visibleData = computed(() => data.slice(visibleStart.value, visibleEnd.value));

	const totalHeight = computed(() => data.length * itemHeight);
	const offsetY = computed(() => visibleStart.value * itemHeight);

	const handleScroll = (e: Event) => {
		scrollTop.value = (e.target as HTMLElement).scrollTop;
		isScrolling.value = true;

		if (scrollTimeout.value) {
			clearTimeout(scrollTimeout.value);
		}

		scrollTimeout.value = window.setTimeout(() => {
			isScrolling.value = false;
		}, 150);
	};

	const scrollToIndex = (index: number) => {
		const targetScrollTop = index * itemHeight;
		const container = scrollContainer || window;

		if (container instanceof HTMLElement) {
			container.scrollTop = targetScrollTop;
		} else {
			window.scrollTo(0, targetScrollTop);
		}
	};

	const scrollToTop = () => {
		scrollToIndex(0);
	};

	const scrollToBottom = () => {
		scrollToIndex(data.length - 1);
	};

	const updateContainerHeight = () => {
		if (scrollContainer instanceof HTMLElement) {
			containerHeight.value = scrollContainer.clientHeight;
		} else {
			containerHeight.value = window.innerHeight;
		}
	};

	onMounted(() => {
		updateContainerHeight();
		const container = scrollContainer || window;
		container.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", updateContainerHeight);
	});

	onUnmounted(() => {
		const container = scrollContainer || window;
		container.removeEventListener("scroll", handleScroll);
		window.removeEventListener("resize", updateContainerHeight);
		if (scrollTimeout.value) {
			clearTimeout(scrollTimeout.value);
		}
	});

	return {
		visibleStart,
		visibleEnd,
		visibleData,
		totalHeight,
		offsetY,
		scrollTop,
		isScrolling,
		scrollToIndex,
		scrollToTop,
		scrollToBottom,
	};
}
