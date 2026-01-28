import { afterEach, describe, expect, it, vi } from "vitest";
import { useTimeoutFn } from "./useTimeoutFn";

vi.useFakeTimers();

describe("useTimeoutFn", () => {
	afterEach(() => {
		vi.clearAllTimers();
	});

	it("should call callback after timeout", () => {
		const callback = vi.fn();
		useTimeoutFn(callback, 1000);

		vi.advanceTimersByTime(500);
		expect(callback).not.toHaveBeenCalled();

		vi.advanceTimersByTime(500);
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it("should not start immediately if immediate is false", () => {
		const callback = vi.fn();
		const { isPending } = useTimeoutFn(callback, 1000, { immediate: false });

		expect(isPending.value).toBe(false);
		vi.advanceTimersByTime(1000);
		expect(callback).not.toHaveBeenCalled();
	});

	it("should start immediately if immediate is true", () => {
		const callback = vi.fn();
		const { isPending } = useTimeoutFn(callback, 1000, { immediate: true });

		expect(isPending.value).toBe(true);
		vi.advanceTimersByTime(1000);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(isPending.value).toBe(false);
	});

	it("should cancel the timeout with stop()", () => {
		const callback = vi.fn();
		const { stop, start } = useTimeoutFn(callback, 1000, { immediate: false });

		start();
		stop();
		vi.advanceTimersByTime(1500);
		expect(callback).not.toHaveBeenCalled();
	});
});
