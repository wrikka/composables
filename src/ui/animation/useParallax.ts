import { computed, type Ref, ref } from "vue";
import { useWindowSize } from "../../browser/screen/useWindowSize";
import { useElementBounding } from "../dimensions/useElementBounding";
import { useMouse } from "../interactions/useMouse";

export interface UseParallaxOptions {
	target?: Ref<HTMLElement | null>;
}

export function useParallax(options: UseParallaxOptions = {}) {
	const target = options.target;
	const { x, y } = useMouse();

	const { width: windowWidth, height: windowHeight } = useWindowSize();
	const elementBounding = useElementBounding(target ?? ref(null));

	const sourceWidth = computed(() =>
		target ? elementBounding.width.value : windowWidth.value,
	);
	const sourceHeight = computed(() =>
		target ? elementBounding.height.value : windowHeight.value,
	);
	const sourceX = computed(() => (target ? elementBounding.left.value : 0));
	const sourceY = computed(() => (target ? elementBounding.top.value : 0));

	const roll = computed(() => {
		if (sourceWidth.value === 0) return 0;
		const halfWidth = sourceWidth.value / 2;
		return (x.value - sourceX.value - halfWidth) / halfWidth;
	});

	const tilt = computed(() => {
		if (sourceHeight.value === 0) return 0;
		const halfHeight = sourceHeight.value / 2;
		return (y.value - sourceY.value - halfHeight) / halfHeight;
	});

	return { roll, tilt };
}
