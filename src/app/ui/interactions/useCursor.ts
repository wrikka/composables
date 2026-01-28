import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import type { UseMouseOptions } from "./useMouse";
import { useMouse } from "./useMouse";

export interface CursorPosition {
	x: number;
	y: number;
}

export interface UseCursorOptions extends UseMouseOptions {
	cursorStyle?: string;
	hotspot?: { x: number; y: number };
	followCursor?: boolean;
	delay?: number;
}

export function useCursor(options: UseCursorOptions = {}) {
	const {
		cursorStyle = "default",
		hotspot = { x: 0, y: 0 },
		followCursor = true,
		delay = 0,
	} = options;

	const { x, y } = useMouse(options);

	const cursorX = ref(0);
	const cursorY = ref(0);
	const cursorStyleRef = ref(cursorStyle);
	const isVisible = ref(true);
	const isPressed = ref(false);

	const position = computed(() => ({ x: cursorX.value, y: cursorY.value }));

	let timeoutId: NodeJS.Timeout | null = null;

	const updateCursor = (newX: number, newY: number) => {
		if (delay > 0) {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				cursorX.value = newX;
				cursorY.value = newY;
			}, delay);
		} else {
			cursorX.value = newX;
			cursorY.value = newY;
		}
	};

	const setCursorStyle = (style: string) => {
		cursorStyleRef.value = style;
		document.body.style.cursor = style;
	};

	const hideCursor = () => {
		isVisible.value = false;
		document.body.style.cursor = "none";
	};

	const showCursor = () => {
		isVisible.value = true;
		document.body.style.cursor = cursorStyleRef.value;
	};

	const setHotspot = (x: number, y: number) => {
		hotspot.x = x;
		hotspot.y = y;
	};

	watch([x, y], ([newX, newY]) => {
		if (followCursor) {
			updateCursor(newX, newY);
		}
	});

	const handleMouseDown = () => {
		isPressed.value = true;
	};

	const handleMouseUp = () => {
		isPressed.value = false;
	};

	const handleMouseEnter = () => {
		showCursor();
	};

	const handleMouseLeave = () => {
		hideCursor();
	};

	onMounted(() => {
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("mouseenter", handleMouseEnter);
		document.addEventListener("mouseleave", handleMouseLeave);
		setCursorStyle(cursorStyle);
	});

	onUnmounted(() => {
		document.removeEventListener("mousedown", handleMouseDown);
		document.removeEventListener("mouseup", handleMouseUp);
		document.removeEventListener("mouseenter", handleMouseEnter);
		document.removeEventListener("mouseleave", handleMouseLeave);
		document.body.style.cursor = "";
		if (timeoutId) clearTimeout(timeoutId);
	});

	return {
		x: cursorX,
		y: cursorY,
		position,
		style: cursorStyleRef,
		isVisible,
		isPressed,
		hotspot,
		setCursorStyle,
		hideCursor,
		showCursor,
		setHotspot,
	};
}
