import { describe, expect, it, vi, beforeEach } from "vitest";
import { useThrottledState } from "./useThrottledState";

describe("useThrottledState", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should initialize with default value", () => {
		const { state, throttledState } = useThrottledState("default");

		expect(state.value).toBe("default");
		expect(throttledState.value).toBe("default");
	});

	it("should throttle state updates", () => {
		const { state, throttledState } = useThrottledState("initial", 300);

		state.value = "first";

		expect(throttledState.value).toBe("first");

		state.value = "second";

		expect(throttledState.value).toBe("first");

		vi.advanceTimersByTime(300);

		expect(throttledState.value).toBe("second");
	});

	it("should cancel pending throttled updates", () => {
		const { state, throttledState, cancel } = useThrottledState("initial", 300);

		state.value = "first";
		state.value = "second";

		cancel();

		vi.advanceTimersByTime(300);

		expect(throttledState.value).toBe("first");
	});

	it("should flush pending updates", () => {
		const { state, throttledState, flush } = useThrottledState("initial", 300);

		state.value = "first";
		state.value = "second";

		flush();

		expect(throttledState.value).toBe("second");
	});

	it("should provide setState function", () => {
		const { setState } = useThrottledState("initial");

		setState("updated");

		expect(setState).toBeDefined();
		expect(typeof setState).toBe("function");
	});

	it("should work with custom delay", () => {
		const { state, throttledState } = useThrottledState("initial", 500);

		state.value = "first";
		state.value = "second";

		vi.advanceTimersByTime(300);

		expect(throttledState.value).toBe("first");

		vi.advanceTimersByTime(200);

		expect(throttledState.value).toBe("second");
	});

	it("should work with complex objects", () => {
		const obj = { name: "test", value: 123 };
		const { state, throttledState } = useThrottledState(obj);

		state.value = { name: "updated", value: 456 };

		vi.advanceTimersByTime(300);

		expect(throttledState.value).toEqual({ name: "updated", value: 456 });
	});

	it("should handle rapid updates", () => {
		const { state, throttledState } = useThrottledState("initial", 300);

		state.value = "first";
		state.value = "second";
		state.value = "third";

		vi.advanceTimersByTime(300);

		expect(throttledState.value).toBe("third");
	});

	it("should update immediately when delay has passed", () => {
		const { state, throttledState } = useThrottledState("initial", 300);

		state.value = "first";

		vi.advanceTimersByTime(300);

		state.value = "second";

		expect(throttledState.value).toBe("second");
	});
});
