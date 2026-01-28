import { onMounted, onUnmounted, ref } from "vue";

export interface PointerOptions {
	onPointerDown?: (event: PointerEvent) => void;
	onPointerMove?: (event: PointerEvent) => void;
	onPointerUp?: (event: PointerEvent) => void;
	onPointerLeave?: (event: PointerEvent) => void;
	onPointerEnter?: (event: PointerEvent) => void;
}

export interface PointerPosition {
	x: number;
	y: number;
}

export function usePointer(options: PointerOptions = {}) {
	const position = ref<PointerPosition>({ x: 0, y: 0 });
	const isPressed = ref(false);
	const isInside = ref(false);
	const pointerType = ref<string>("");

	const handlePointerDown = (event: PointerEvent) => {
		isPressed.value = true;
		position.value = { x: event.clientX, y: event.clientY };
		pointerType.value = event.pointerType;
		options.onPointerDown?.(event);
	};

	const handlePointerUp = (event: PointerEvent) => {
		isPressed.value = false;
		position.value = { x: event.clientX, y: event.clientY };
		options.onPointerUp?.(event);
	};

	const handlePointerMove = (event: PointerEvent) => {
		position.value = { x: event.clientX, y: event.clientY };
		options.onPointerMove?.(event);
	};

	const handlePointerEnter = (event: PointerEvent) => {
		isInside.value = true;
		position.value = { x: event.clientX, y: event.clientY };
		options.onPointerEnter?.(event);
	};

	const handlePointerLeave = (event: PointerEvent) => {
		isInside.value = false;
		isPressed.value = false;
		position.value = { x: event.clientX, y: event.clientY };
		options.onPointerLeave?.(event);
	};

	const distanceFrom = (x: number, y: number): number => {
		const dx = position.value.x - x;
		const dy = position.value.y - y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	const isInArea = (
		x: number,
		y: number,
		width: number,
		height: number,
	): boolean => {
		return (
			position.value.x >= x &&
			position.value.x <= x + width &&
			position.value.y >= y &&
			position.value.y <= y + height
		);
	};

	onMounted(() => {
		window.addEventListener("pointerdown", handlePointerDown);
		window.addEventListener("pointerup", handlePointerUp);
		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerenter", handlePointerEnter);
		window.addEventListener("pointerleave", handlePointerLeave);
	});

	onUnmounted(() => {
		window.removeEventListener("pointerdown", handlePointerDown);
		window.removeEventListener("pointerup", handlePointerUp);
		window.removeEventListener("pointermove", handlePointerMove);
		window.removeEventListener("pointerenter", handlePointerEnter);
		window.removeEventListener("pointerleave", handlePointerLeave);
	});

	return {
		position,
		isPressed,
		isInside,
		pointerType,
		distanceFrom,
		isInArea,
	};
}
