import type { Ref } from "vue";
import { onUnmounted, ref, watch } from "vue";

export function useElementBounding(
	target: Ref<HTMLElement | null | undefined>,
) {
	const height = ref(0);
	const width = ref(0);
	const top = ref(0);
	const left = ref(0);
	const right = ref(0);
	const bottom = ref(0);
	const x = ref(0);
	const y = ref(0);

	let observer: ResizeObserver | null = null;

	const update = () => {
		const el = target.value;
		if (!el) return;

		const rect = el.getBoundingClientRect();
		height.value = rect.height;
		width.value = rect.width;
		top.value = rect.top;
		left.value = rect.left;
		right.value = rect.right;
		bottom.value = rect.bottom;
		x.value = rect.x;
		y.value = rect.y;
	};

	const stop = () => {
		if (observer) {
			observer.disconnect();
			observer = null;
		}
		window.removeEventListener("scroll", update);
	};

	watch(
		target,
		(el) => {
			stop();
			if (el) {
				update();
				observer = new ResizeObserver(update);
				observer.observe(el);
				window.addEventListener("scroll", update, { passive: true });
			}
		},
		{ immediate: true, flush: "post" },
	);

	onUnmounted(stop);

	return {
		height,
		width,
		top,
		left,
		right,
		bottom,
		x,
		y,
		update,
	};
}
