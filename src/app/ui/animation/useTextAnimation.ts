import { computed, type MaybeRef, ref, unref } from "vue";
import { useIntervalFn } from "./useIntervalFn";

export interface UseTextAnimationOptions {
	interval?: MaybeRef<number>;
	immediate?: boolean;
}

export function useTextAnimation(
	text: MaybeRef<string>,
	options: UseTextAnimationOptions = {},
) {
	const { interval = 100, immediate = true } = options;

	const sourceText = ref(text);
	const currentIndex = ref(0);

	const animatedText = computed(() =>
		sourceText.value.slice(0, currentIndex.value),
	);

	const { isActive, start, stop } = useIntervalFn(
		() => {
			if (currentIndex.value >= sourceText.value.length) {
				stop();
				return;
			}
			currentIndex.value++;
		},
		unref(interval),
		{ immediate: false },
	);

	const restart = () => {
		stop();
		currentIndex.value = 0;
		start();
	};

	if (immediate) {
		start();
	}

	return { animatedText, isActive, restart, start, stop };
}
