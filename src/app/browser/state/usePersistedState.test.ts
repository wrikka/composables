import { describe, expect, it, beforeEach } from "vitest";
import { usePersistedState } from "./usePersistedState";

describe("usePersistedState", () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});

	it("should initialize with default value", () => {
		const { state } = usePersistedState("test-key", "default");

		expect(state.value).toBe("default");
	});

	it("should read existing value from storage", () => {
		localStorage.setItem("test-key", JSON.stringify("existing"));

		const { state } = usePersistedState("test-key", "default");

		expect(state.value).toBe("existing");
	});

	it("should save state to storage", () => {
		const { state } = usePersistedState("test-key", "default");

		state.value = "updated";

		expect(localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
	});

	it("should work with sessionStorage", () => {
		const { state } = usePersistedState("test-key", "default", {
			storage: sessionStorage,
		});

		state.value = "updated";

		expect(sessionStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
	});

	it("should provide load function", () => {
		localStorage.setItem("test-key", JSON.stringify("loaded"));

		const { state, load } = usePersistedState("test-key", "default");

		load();

		expect(state.value).toBe("loaded");
	});

	it("should provide save function", () => {
		const { state, save } = usePersistedState("test-key", "default");

		state.value = "updated";
		save(state.value);

		expect(localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
	});

	it("should provide reset function", () => {
		const { state, reset } = usePersistedState("test-key", "default");

		state.value = "updated";
		reset();

		expect(state.value).toBe("default");
		expect(localStorage.getItem("test-key")).toBeNull();
	});

	it("should work with complex objects", () => {
		const obj = { name: "test", value: 123 };
		const { state } = usePersistedState("test-key", obj);

		state.value = { name: "updated", value: 456 };

		expect(localStorage.getItem("test-key")).toBe(JSON.stringify({ name: "updated", value: 456 }));
	});

	it("should work with arrays", () => {
		const arr = [1, 2, 3];
		const { state } = usePersistedState("test-key", arr);

		state.value = [4, 5, 6];

		expect(localStorage.getItem("test-key")).toBe(JSON.stringify([4, 5, 6]));
	});

	it("should use custom serializer", () => {
		const customSerializer = {
			read: (v: string) => v.toUpperCase(),
			write: (v: string) => v.toLowerCase(),
		};

		const { state } = usePersistedState("test-key", "DEFAULT", {
			serializer: customSerializer,
		});

		state.value = "TEST";

		expect(localStorage.getItem("test-key")).toBe("test");
	});

	it("should handle invalid JSON in storage", () => {
		localStorage.setItem("test-key", "invalid json");

		const { state } = usePersistedState("test-key", "default");

		expect(state.value).toBe("default");
	});
});
