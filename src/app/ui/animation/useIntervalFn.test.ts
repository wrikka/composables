import { afterEach, describe, expect, it, vi } from "vitest";
import { useIntervalFn } from "./useIntervalFn";

vi.useFakeTimers();

describe("useIntervalFn", () => {
	afterEach(() => {
		vi.clearAllTimers();
	});

	it("should call callback every interval", () => {
		const callback = vi.fn();
		useIntervalFn(callback, 1000);

		vi.advanceTimersByTime(5000);

		expect(callback).toHaveBeenCalledTimes(5);
	});

	it("should not start immediately by default", () => {
		const callback = vi.fn();
		useIntervalFn(callback, 1000);

		vi.advanceTimersByTime(500);

		expect(callback).not.toHaveBeenCalled();
	});

	it("should start immediately if immediate is true", () => {
		const callback = vi.fn();
		useIntervalFn(callback, 1000, { immediate: true });

		expect(callback).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(1000);

		expect(callback).toHaveBeenCalledTimes(2);
	});

	it("should be pausable and resumable", () => {
		const callback = vi.fn();
		const { pause, resume } = useIntervalFn(callback, 1000);

		vi.advanceTimersByTime(2000);
		expect(callback).toHaveBeenCalledTimes(2);

		pause();
		vi.advanceTimersByTime(2000);
		expect(callback).toHaveBeenCalledTimes(2);

		resume();
		vi.advanceTimersByTime(2000);
		expect(callback).toHaveBeenCalledTimes(4);
	});
});
