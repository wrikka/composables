import { onMounted, onUnmounted, type Ref, ref } from "vue";

export interface Position {
	x: number;
	y: number;
}

export interface UseDraggableOptions {
	initialValue?: Position;
	handle?: string;
	axis?: "x" | "y" | "both";
	bounds?: {
		left?: number;
		top?: number;
		right?: number;
		bottom?: number;
	};
	container?: HTMLElement;
	onStart?: (position: Position) => void;
	onMove?: (position: Position) => void;
	onEnd?: (position: Position) => void;
}

export function useDraggable(
	targetRef: Ref<HTMLElement | null>,
	options: UseDraggableOptions = {},
) {
	const {
		initialValue = { x: 0, y: 0 },
		handle,
		axis = "both",
		bounds,
		container,
		onStart,
		onMove,
		onEnd,
	} = options;

	const position = ref({ ...initialValue });
	const isDragging = ref(false);
	const startPosition = ref({ ...initialValue });
	const mousePosition = ref({ x: 0, y: 0 });

	const isWithinBounds = (x: number, y: number): boolean => {
		if (!bounds) return true;

		const containerBounds = container
			? container.getBoundingClientRect()
			: null;
		const targetBounds = targetRef.value?.getBoundingClientRect();

		let minX = bounds.left ?? -Infinity;
		let maxX = bounds.right ?? Infinity;
		let minY = bounds.top ?? -Infinity;
		let maxY = bounds.bottom ?? Infinity;

		if (container && targetBounds && containerBounds) {
			minX = Math.max(minX, 0);
			maxX = Math.min(maxX, containerBounds.width - targetBounds.width);
			minY = Math.max(minY, 0);
			maxY = Math.min(maxY, containerBounds.height - targetBounds.height);
		}

		return x >= minX && x <= maxX && y >= minY && y <= maxY;
	};

	const clampPosition = (x: number, y: number): Position => {
		if (!bounds) return { x, y };

		const containerBounds = container
			? container.getBoundingClientRect()
			: null;
		const targetBounds = targetRef.value?.getBoundingClientRect();

		let minX = bounds.left ?? -Infinity;
		let maxX = bounds.right ?? Infinity;
		let minY = bounds.top ?? -Infinity;
		let maxY = bounds.bottom ?? Infinity;

		if (container && targetBounds && containerBounds) {
			minX = Math.max(minX, 0);
			maxX = Math.min(maxX, containerBounds.width - targetBounds.width);
			minY = Math.max(minY, 0);
			maxY = Math.min(maxY, containerBounds.height - targetBounds.height);
		}

		return {
			x: Math.max(minX, Math.min(maxX, x)),
			y: Math.max(minY, Math.min(maxY, y)),
		};
	};

	const handleMouseDown = (event: MouseEvent) => {
		if (!targetRef.value) return;

		const target = event.target as HTMLElement;
		if (handle && !target.closest(handle)) return;

		event.preventDefault();

		isDragging.value = true;
		startPosition.value = { ...position.value };
		mousePosition.value = { x: event.clientX, y: event.clientY };

		onStart?.(position.value);

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseMove = (event: MouseEvent) => {
		if (!isDragging.value) return;

		const deltaX = event.clientX - mousePosition.value.x;
		const deltaY = event.clientY - mousePosition.value.y;

		let newX = startPosition.value.x;
		let newY = startPosition.value.y;

		if (axis === "x" || axis === "both") {
			newX += deltaX;
		}
		if (axis === "y" || axis === "both") {
			newY += deltaY;
		}

		const clampedPosition = clampPosition(newX, newY);

		if (isWithinBounds(clampedPosition.x, clampedPosition.y)) {
			position.value = clampedPosition;
			onMove?.(position.value);
		}
	};

	const handleMouseUp = () => {
		if (!isDragging.value) return;

		isDragging.value = false;
		onEnd?.(position.value);

		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
	};

	const handleTouchStart = (event: TouchEvent) => {
		if (!targetRef.value) return;

		const target = event.target as HTMLElement;
		if (handle && !target.closest(handle)) return;

		event.preventDefault();

		if (!event.touches || event.touches.length === 0) return;

		const touch = event.touches[0];
		if (!touch) return;
		isDragging.value = true;
		startPosition.value = { ...position.value };
		mousePosition.value = { x: touch.clientX, y: touch.clientY };

		onStart?.(position.value);

		document.addEventListener("touchmove", handleTouchMove);
		document.addEventListener("touchend", handleTouchEnd);
	};

	const handleTouchMove = (event: TouchEvent) => {
		if (!isDragging.value) return;
		if (!event.touches || event.touches.length === 0) return;

		const touch = event.touches[0];
		if (!touch) return;

		const deltaX = touch.clientX - mousePosition.value.x;
		const deltaY = touch.clientY - mousePosition.value.y;

		let newX = startPosition.value.x;
		let newY = startPosition.value.y;

		if (axis === "x" || axis === "both") {
			newX += deltaX;
		}
		if (axis === "y" || axis === "both") {
			newY += deltaY;
		}

		const clampedPosition = clampPosition(newX, newY);

		if (isWithinBounds(clampedPosition.x, clampedPosition.y)) {
			position.value = clampedPosition;
			onMove?.(position.value);
		}
	};

	const handleTouchEnd = () => {
		if (!isDragging.value) return;

		isDragging.value = false;
		onEnd?.(position.value);

		document.removeEventListener("touchmove", handleTouchMove);
		document.removeEventListener("touchend", handleTouchEnd);
	};

	const reset = () => {
		position.value = { ...initialValue };
	};

	const stop = () => {
		isDragging.value = false;
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
		document.removeEventListener("touchmove", handleTouchMove);
		document.removeEventListener("touchend", handleTouchEnd);
	};

	onMounted(() => {
		if (targetRef.value) {
			targetRef.value.addEventListener("mousedown", handleMouseDown);
			targetRef.value.addEventListener("touchstart", handleTouchStart);
		}
	});

	onUnmounted(() => {
		stop();
		if (targetRef.value) {
			targetRef.value.removeEventListener("mousedown", handleMouseDown);
			targetRef.value.removeEventListener("touchstart", handleTouchStart);
		}
	});

	return {
		position,
		isDragging,
		reset,
		stop,
	};
}
