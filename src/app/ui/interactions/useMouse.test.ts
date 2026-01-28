import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMouse } from "./useMouse";

describe("useMouse", () => {
	let mockTarget: any;

	beforeEach(() => {
		mockTarget = {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		};
	});

	it("should initialize with default values", () => {
		const { x, y, mouse, sourceType } = useMouse();

		expect(x.value).toBe(0);
		expect(y.value).toBe(0);
		expect(mouse.value).toEqual({ x: 0, y: 0 });
		expect(sourceType.value).toBe("page");
	});

	it("should update position on mouse move", () => {
		const { x, y } = useMouse({ target: mockTarget });

		// Simulate mouse move event
		const mockEvent = {
			pageX: 100,
			pageY: 200,
		};

		const callback = mockTarget.addEventListener.mock.calls[0][1];
		callback(mockEvent);

		expect(x.value).toBe(100);
		expect(y.value).toBe(200);
	});

	it("should handle different position types", () => {
		const { x, y } = useMouse({
			target: mockTarget,
			type: "client",
		});

		const mockEvent = {
			clientX: 50,
			clientY: 75,
		};

		const callback = mockTarget.addEventListener.mock.calls[0][1];
		callback(mockEvent);

		expect(x.value).toBe(50);
		expect(y.value).toBe(75);
	});

	it("should cleanup event listeners on unmount", () => {
		useMouse({ target: mockTarget });

		// Simulate unmount
		const mockOnUnmounted = vi.fn();
		vi.stubGlobal("onUnmounted", mockOnUnmounted);

		useMouse({ target: mockTarget });

		// Call the cleanup function if it was registered
		if (mockOnUnmounted.mock.calls[0]?.[0]) {
			mockOnUnmounted.mock.calls[0][0]();
		}

		expect(mockTarget.removeEventListener).toHaveBeenCalledWith(
			"mousemove",
			expect.any(Function),
		);
	});
});
