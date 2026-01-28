import { describe, expect, it, beforeEach } from "vitest";
import { useGlobalState } from "./useGlobalState";

describe("useGlobalState", () => {
	beforeEach(() => {
		const globalState = (useGlobalState as any).globalState || new Map();
		globalState.clear();
		(useGlobalState as any).globalState = globalState;
	});

	it("should initialize with default value", () => {
		const { state } = useGlobalState("test-key", "default");

		expect(state.value).toBe("default");
	});

	it("should share state across instances", () => {
		const instance1 = useGlobalState("test-key", "default");
		const instance2 = useGlobalState("test-key", "default");

		instance1.setState("updated");

		expect(instance1.state.value).toBe("updated");
		expect(instance2.state.value).toBe("updated");
	});

	it("should provide setState function", () => {
		const { state, setState } = useGlobalState("test-key", "default");

		setState("updated");

		expect(state.value).toBe("updated");
	});

	it("should provide resetState function", () => {
		const { state, setState, resetState } = useGlobalState("test-key", "default");

		setState("updated");
		resetState();

		expect(state.value).toBe("default");
	});

	it("should work with complex objects", () => {
		const obj = { name: "test", value: 123 };
		const { state, setState } = useGlobalState("test-key", obj);

		setState({ name: "updated", value: 456 });

		expect(state.value).toEqual({ name: "updated", value: 456 });
	});

	it("should work with arrays", () => {
		const arr = [1, 2, 3];
		const { state, setState } = useGlobalState("test-key", arr);

		setState([4, 5, 6]);

		expect(state.value).toEqual([4, 5, 6]);
	});

	it("should create separate states for different keys", () => {
		const state1 = useGlobalState("key1", "value1");
		const state2 = useGlobalState("key2", "value2");

		state1.setState("updated1");

		expect(state1.state.value).toBe("updated1");
		expect(state2.state.value).toBe("value2");
	});

	it("should provide computed state", () => {
		const { state } = useGlobalState("test-key", "default");

		expect(state).toBeDefined();
	});
});
