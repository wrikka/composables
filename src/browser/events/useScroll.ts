import { onMounted, onUnmounted, type Ref, ref } from "vue";

export interface UseScrollReturn {
	x: Ref<number>;
	y: Ref<number>;
	isScrolling: Ref<boolean>;
	arrivedState: {
		top: Ref<boolean>;
		bottom: Ref<boolean>;
		left: Ref<boolean>;
		right: Ref<boolean>;
	};
}

export function useScroll(
	target: Ref<HTMLElement | Window | null> = ref(window),
): UseScrollReturn {
	const x = ref(0);
	const y = ref(0);
	const isScrolling = ref(false);

	const arrivedState = {
		top: ref(true),
		bottom: ref(false),
		left: ref(true),
		right: ref(false),
	};

	let timeout: number | null = null;

	const onScroll = (event: Event) => {
		const el =
			event.target === document ? window : (event.target as HTMLElement);
		const scrollLeft = "scrollLeft" in el ? el.scrollLeft : window.scrollX;
		const scrollTop = "scrollTop" in el ? el.scrollTop : window.scrollY;

		x.value = scrollLeft;
		y.value = scrollTop;

		const clientWidth =
			"clientWidth" in el ? el.clientWidth : window.innerWidth;
		const clientHeight =
			"clientHeight" in el ? el.clientHeight : window.innerHeight;
		const scrollWidth =
			"scrollWidth" in el ? el.scrollWidth : document.body.scrollWidth;
		const scrollHeight =
			"scrollHeight" in el ? el.scrollHeight : document.body.scrollHeight;

		arrivedState.left.value = scrollLeft <= 0;
		arrivedState.right.value = scrollLeft + clientWidth >= scrollWidth;
		arrivedState.top.value = scrollTop <= 0;
		arrivedState.bottom.value = scrollTop + clientHeight >= scrollHeight;

		isScrolling.value = true;
		if (timeout) clearTimeout(timeout);
		timeout = window.setTimeout(() => {
			isScrolling.value = false;
		}, 100);
	};

	onMounted(() => {
		const el = target.value || window;
		el.addEventListener("scroll", onScroll, { passive: true });
	});

	onUnmounted(() => {
		const el = target.value || window;
		el.removeEventListener("scroll", onScroll);
	});

	return { x, y, isScrolling, arrivedState };
}
