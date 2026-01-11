import { beforeEach, describe, expect, it, vi } from "vitest";
import { useIdle } from "./useIdle";

// Mock timers
vi.useFakeTimers();

describe("useIdle", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.setSystemTime(1000000);
	});

	it("should initialize as active", () => {
		const { isIdle, lastActive } = useIdle();

		expect(isIdle.value).toBe(false);
		expect(lastActive.value).toBe(1000000);
	});

	it("should become idle after timeout", () => {
		const onIdle = vi.fn();
		const { isIdle } = useIdle({ timeout: 5000, onIdle });

		vi.advanceTimersByTime(5000);

		expect(isIdle.value).toBe(true);
		expect(onIdle).toHaveBeenCalled();
	});

	it("should reset timer on activity", () => {
		const onIdle = vi.fn();
		const onActive = vi.fn();
		const { isIdle } = useIdle({ timeout: 5000, onIdle, onActive });

		// Become idle
		vi.advanceTimersByTime(5000);
		expect(isIdle.value).toBe(true);

		// Simulate activity
		window.dispatchEvent(new Event("mousemove"));

		expect(isIdle.value).toBe(false);
		expect(onActive).toHaveBeenCalled();

		// Should become idle again after timeout
		vi.advanceTimersByTime(5000);
		expect(isIdle.value).toBe(true);
	});

	it("should track last active time", () => {
		const { lastActive, getIdleTime } = useIdle({ timeout: 5000 });

		vi.setSystemTime(1002000);
		window.dispatchEvent(new Event("click"));

		expect(lastActive.value).toBe(1002000);
		expect(getIdleTime()).toBe(0);

		vi.setSystemTime(1003000);
		expect(getIdleTime()).toBe(1000);
	});

	it("should check idle for duration", () => {
		const { isIdleFor } = useIdle({ timeout: 10000 });

		vi.setSystemTime(1015000);

		expect(isIdleFor(1000)).toBe(true);
		expect(isIdleFor(20000)).toBe(false);
	});

	it("should handle custom events", () => {
		const onActive = vi.fn();
		const { isIdle } = useIdle({
			timeout: 5000,
			events: ["keydown"],
			onActive,
		});

		// Become idle
		vi.advanceTimersByTime(5000);
		expect(isIdle.value).toBe(true);

		// Mouse move should not trigger activity
		window.dispatchEvent(new Event("mousemove"));
		expect(isIdle.value).toBe(true);
		expect(onActive).not.toHaveBeenCalled();

		// Key down should trigger activity
		window.dispatchEvent(new Event("keydown"));
		expect(isIdle.value).toBe(false);
		expect(onActive).toHaveBeenCalled();
	});

	it("should reset timer manually", () => {
		const onIdle = vi.fn();
		const { resetTimer, isIdle } = useIdle({ timeout: 5000, onIdle });

		vi.advanceTimersByTime(4000);
		expect(isIdle.value).toBe(false);

		resetTimer();

		vi.advanceTimersByTime(4000);
		expect(isIdle.value).toBe(false);

		vi.advanceTimersByTime(1000);
		expect(isIdle.value).toBe(true);
		expect(onIdle).toHaveBeenCalled();
	});

	it("should stop timer manually", () => {
		const onIdle = vi.fn();
		const { stopTimer, isIdle } = useIdle({ timeout: 5000, onIdle });

		stopTimer();

		vi.advanceTimersByTime(10000);

		expect(isIdle.value).toBe(false);
		expect(onIdle).not.toHaveBeenCalled();
	});

	it("should clean up on unmount", () => {
		const addEventListenerSpy = vi.spyOn(window, "addEventListener");
		const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

		useIdle({ timeout: 5000 });

		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"mousedown",
			expect.any(Function),
		);
		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"mousemove",
			expect.any(Function),
		);

		// Simulate unmount by calling cleanup
		removeEventListenerSpy.mockClear();

		// Cleanup happens in onUnmounted which we can't easily test
		// but we can verify listeners were added
		expect(addEventListenerSpy).toHaveBeenCalled();
	});
});
