import { nextTick, type Ref, ref } from "vue";

export interface UseFlipOptions {
	duration?: number;
	easing?: string;
}

export function useFlip(
	target: Ref<(HTMLElement | null)[]>,
	options: UseFlipOptions = {},
) {
	const { duration = 500, easing = "ease-in-out" } = options;
	const states = ref<Map<HTMLElement, DOMRect>>(new Map());

	const record = () => {
		const newStates = new Map<HTMLElement, DOMRect>();
		target.value.forEach((el) => {
			if (el) {
				newStates.set(el, el.getBoundingClientRect());
			}
		});
		states.value = newStates;
	};

	const play = async () => {
		record();

		await nextTick();

		target.value.forEach((el) => {
			if (!el) return;

			const oldState = states.value.get(el);
			const newState = el.getBoundingClientRect();

			if (oldState) {
				const dx = oldState.left - newState.left;
				const dy = oldState.top - newState.top;
				const dw = oldState.width / newState.width;
				const dh = oldState.height / newState.height;

				el.animate(
					[
						{
							transform: `translate(${dx}px, ${dy}px) scale(${dw}, ${dh})`,
						},
						{
							transform: "none",
						},
					],
					{
						duration,
						easing,
					},
				);
			}
		});
	};

	return { play };
}
