import { onUnmounted, type Ref, ref } from "vue";

export interface UseRafFnOptions {
	immediate?: boolean;
}

export interface UseRafFnReturn {
	isActive: Ref<boolean>;
	pause: () => void;
	resume: () => void;
}

export function useRafFn(
	callback: (timestamp: number) => void,
	options: UseRafFnOptions = {},
): UseRafFnReturn {
	const { immediate = true } = options;

	const isActive = ref(false);
	let rafId: number | null = null;

	const loop = (timestamp: number) => {
		if (!isActive.value || rafId === null) return;

		callback(timestamp);
		rafId = window.requestAnimationFrame(loop);
	};

	const resume = () => {
		if (isActive.value || rafId !== null) return;
		isActive.value = true;
		rafId = window.requestAnimationFrame(loop);
	};

	const pause = () => {
		if (!isActive.value || rafId === null) return;
		isActive.value = false;
		if (rafId !== null) {
			window.cancelAnimationFrame(rafId);
			rafId = null;
		}
	};

	if (immediate) {
		resume();
	}

	onUnmounted(() => {
		pause();
	});

	return {
		isActive,
		pause,
		resume,
	};
}
