import { describe, expect, it, vi, beforeEach } from "vitest";
import { useDebouncedState } from "./useDebouncedState";

describe("useDebouncedState", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should initialize with default value", () => {
		const { state, debouncedState } = useDebouncedState("default");

		expect(state.value).toBe("default");
		expect(debouncedState.value).toBe("default");
	});

	it("should debounce state updates", () => {
		const { state, debouncedState } = useDebouncedState("initial", 300);

		state.value = "updated";

		expect(debouncedState.value).toBe("initial");

		vi.advanceTimersByTime(300);

		expect(debouncedState.value).toBe("updated");
	});

	it("should cancel pending debounced updates", () => {
		const { state, debouncedState, cancel } = useDebouncedState("initial", 300);

		state.value = "first";
		state.value = "second";

		cancel();

		vi.advanceTimersByTime(300);

		expect(debouncedState.value).toBe("initial");
	});

	it("should flush pending updates", () => {
		const { state, debouncedState, flush } = useDebouncedState("initial", 300);

		state.value = "updated";

		flush();

		expect(debouncedState.value).toBe("updated");
	});

	it("should provide setState function", () => {
		const { setState } = useDebouncedState("initial");

		setState("updated");

		expect(setState).toBeDefined();
		expect(typeof setState).toBe("function");
	});

	it("should work with custom delay", () => {
		const { state, debouncedState } = useDebouncedState("initial", 500);

		state.value = "updated";

		vi.advanceTimersByTime(300);

		expect(debouncedState.value).toBe("initial");

		vi.advanceTimersByTime(200);

		expect(debouncedState.value).toBe("updated");
	});

	it("should work with complex objects", () => {
		const obj = { name: "test", value: 123 };
		const { state, debouncedState } = useDebouncedState(obj);

		state.value = { name: "updated", value: 456 };

		vi.advanceTimersByTime(300);

		expect(debouncedState.value).toEqual({ name: "updated", value: 456 });
	});

	it("should handle rapid updates", () => {
		const { state, debouncedState } = useDebouncedState("initial", 300);

		state.value = "first";
		state.value = "second";
		state.value = "third";

		vi.advanceTimersByTime(300);

		expect(debouncedState.value).toBe("third");
	});
});
