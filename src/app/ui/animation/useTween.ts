import { type Ref, ref } from "vue";
import { type EasingFunction, linear } from "./easing";
import { useRafFn } from "./useRafFn";

export interface UseTweenOptions {
	duration?: number;
	easing?: EasingFunction;
	onFinished?: () => void;
	onUpdate?: (value: number) => void;
}

export function useTween(
	from: Ref<number> | number,
	to: Ref<number> | number,
	options: UseTweenOptions = {},
): Ref<number> {
	const { duration = 1000, easing = linear, onFinished, onUpdate } = options;

	const fromValue = ref(from);
	const toValue = ref(to);

	const output = ref(fromValue.value);

	let startTime: number | null = null;

	const { pause } = useRafFn(
		(timestamp) => {
			if (startTime === null) startTime = timestamp;

			const elapsedTime = timestamp - startTime;
			const progress = Math.min(1, elapsedTime / duration);
			const easedProgress = easing(progress);

			output.value =
				fromValue.value + (toValue.value - fromValue.value) * easedProgress;

			onUpdate?.(output.value);

			if (progress >= 1) {
				pause();
				onFinished?.();
			}
		},
		{ immediate: true },
	);

	return output;
}
