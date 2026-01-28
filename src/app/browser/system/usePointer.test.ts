import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePointer } from "./usePointer";

// Mock window events
const addEventListenerSpy = vi.spyOn(window, "addEventListener");

describe("usePointer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with default values", () => {
		const { position, isPressed, isInside, pointerType } = usePointer();

		expect(position.value).toEqual({ x: 0, y: 0 });
		expect(isPressed.value).toBe(false);
		expect(isInside.value).toBe(false);
		expect(pointerType.value).toBe("");
	});

	it("should handle pointer down event", () => {
		const onPointerDown = vi.fn();
		const { position, isPressed, pointerType } = usePointer({ onPointerDown });

		const event = new PointerEvent("pointerdown", {
			clientX: 100,
			clientY: 200,
			pointerType: "mouse",
		});

		window.dispatchEvent(event);

		expect(position.value).toEqual({ x: 100, y: 200 });
		expect(isPressed.value).toBe(true);
		expect(pointerType.value).toBe("mouse");
		expect(onPointerDown).toHaveBeenCalledWith(event);
	});

	it("should handle pointer up event", () => {
		const onPointerUp = vi.fn();
		const { position, isPressed } = usePointer({ onPointerUp });

		const event = new PointerEvent("pointerup", {
			clientX: 150,
			clientY: 250,
		});

		window.dispatchEvent(event);

		expect(position.value).toEqual({ x: 150, y: 250 });
		expect(isPressed.value).toBe(false);
		expect(onPointerUp).toHaveBeenCalledWith(event);
	});

	it("should handle pointer move event", () => {
		const onPointerMove = vi.fn();
		const { position } = usePointer({ onPointerMove });

		const event = new PointerEvent("pointermove", {
			clientX: 300,
			clientY: 400,
		});

		window.dispatchEvent(event);

		expect(position.value).toEqual({ x: 300, y: 400 });
		expect(onPointerMove).toHaveBeenCalledWith(event);
	});

	it("should handle pointer enter event", () => {
		const onPointerEnter = vi.fn();
		const { position, isInside } = usePointer({ onPointerEnter });

		const event = new PointerEvent("pointerenter", {
			clientX: 50,
			clientY: 75,
		});

		window.dispatchEvent(event);

		expect(position.value).toEqual({ x: 50, y: 75 });
		expect(isInside.value).toBe(true);
		expect(onPointerEnter).toHaveBeenCalledWith(event);
	});

	it("should handle pointer leave event", () => {
		const onPointerLeave = vi.fn();
		const { position, isInside, isPressed } = usePointer({ onPointerLeave });

		// First enter to set pressed state
		window.dispatchEvent(new PointerEvent("pointerdown"));

		const event = new PointerEvent("pointerleave", {
			clientX: 10,
			clientY: 20,
		});

		window.dispatchEvent(event);

		expect(position.value).toEqual({ x: 10, y: 20 });
		expect(isInside.value).toBe(false);
		expect(isPressed.value).toBe(false);
		expect(onPointerLeave).toHaveBeenCalledWith(event);
	});

	it("should calculate distance from point", () => {
		const { position, distanceFrom } = usePointer();

		position.value = { x: 100, y: 100 };

		expect(distanceFrom(0, 0)).toBeCloseTo(141.42, 1);
		expect(distanceFrom(100, 0)).toBe(100);
		expect(distanceFrom(100, 100)).toBe(0);
	});

	it("should check if pointer is in area", () => {
		const { position, isInArea } = usePointer();

		position.value = { x: 150, y: 250 };

		expect(isInArea(100, 200, 100, 100)).toBe(true);
		expect(isInArea(0, 0, 100, 100)).toBe(false);
		expect(isInArea(150, 250, 0, 0)).toBe(true);
		expect(isInArea(250, 350, 100, 100)).toBe(false);
	});

	it("should set up event listeners", () => {
		usePointer();

		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"pointerdown",
			expect.any(Function),
		);
		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"pointerup",
			expect.any(Function),
		);
		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"pointermove",
			expect.any(Function),
		);
		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"pointerenter",
			expect.any(Function),
		);
		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"pointerleave",
			expect.any(Function),
		);
	});
});
