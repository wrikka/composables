import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCursor } from "./useCursor";

describe("useCursor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(document.body, "style", {
			value: { cursor: "" },
			writable: true,
		});
	});

	it("should initialize with default values", () => {
		const { x, y, position, style, isVisible, isPressed } = useCursor();

		expect(x.value).toBe(0);
		expect(y.value).toBe(0);
		expect(position.value).toEqual({ x: 0, y: 0 });
		expect(style.value).toBe("default");
		expect(isVisible.value).toBe(true);
		expect(isPressed.value).toBe(false);
	});

	it("should set cursor style", () => {
		const { setCursorStyle } = useCursor();

		setCursorStyle("pointer");

		expect(document.body.style.cursor).toBe("pointer");
	});

	it("should hide and show cursor", () => {
		const { hideCursor, showCursor, isVisible } = useCursor();

		hideCursor();
		expect(isVisible.value).toBe(false);
		expect(document.body.style.cursor).toBe("none");

		showCursor();
		expect(isVisible.value).toBe(true);
		expect(document.body.style.cursor).toBe("default");
	});

	it("should handle mouse press state", () => {
		const { isPressed } = useCursor();

		// Simulate mouse down
		const mouseDownEvent = new MouseEvent("mousedown");
		document.dispatchEvent(mouseDownEvent);

		expect(isPressed.value).toBe(true);

		// Simulate mouse up
		const mouseUpEvent = new MouseEvent("mouseup");
		document.dispatchEvent(mouseUpEvent);

		expect(isPressed.value).toBe(false);
	});

	it("should set hotspot position", () => {
		const { hotspot, setHotspot } = useCursor();

		setHotspot(5, 10);

		expect(hotspot.x).toBe(5);
		expect(hotspot.y).toBe(10);
	});

	it("should follow mouse movement", () => {
		const { x, y } = useCursor({ followCursor: true });

		// Simulate mouse move
		const mouseMoveEvent = new MouseEvent("mousemove", {
			clientX: 150,
			clientY: 250,
		});
		document.dispatchEvent(mouseMoveEvent);

		expect(x.value).toBe(150);
		expect(y.value).toBe(250);
	});
});
