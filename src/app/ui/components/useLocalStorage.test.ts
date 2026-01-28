import { describe, it, expect, beforeEach } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("should initialize with default value", () => {
		const { value } = useLocalStorage("test-key", "default");

		expect(value.value).toBe("default");
	});

	it("should read from localStorage", () => {
		localStorage.setItem("test-key", JSON.stringify("stored-value"));
		const { value } = useLocalStorage("test-key", "default");

		expect(value.value).toBe("stored-value");
	});

	it("should write to localStorage", () => {
		const { value } = useLocalStorage("test-key", "default");

		value.value = "new-value";
		expect(localStorage.getItem("test-key")).toBe(JSON.stringify("new-value"));
	});

	it("should remove from localStorage", () => {
		const { value, remove } = useLocalStorage("test-key", "default");

		value.value = "test-value";
		remove();
		expect(localStorage.getItem("test-key")).toBeNull();
	});

	it("should handle objects", () => {
		const { value } = useLocalStorage("test-key", { foo: "bar" });

		value.value = { foo: "baz" };
		expect(localStorage.getItem("test-key")).toBe(JSON.stringify({ foo: "baz" }));
	});

	it("should handle arrays", () => {
		const { value } = useLocalStorage("test-key", [1, 2, 3]);

		value.value = [4, 5, 6];
		expect(localStorage.getItem("test-key")).toBe(JSON.stringify([4, 5, 6]));
	});

	it("should handle null values", () => {
		const { value } = useLocalStorage("test-key", "default");

		value.value = null;
		expect(localStorage.getItem("test-key")).toBe("null");
	});

	it("should use custom storage", () => {
		const storage = {
			getItem: () => "custom-value",
			setItem: () => {},
			removeItem: () => {},
		} as Storage;
		const { value } = useLocalStorage("test-key", "default", { storage });

		expect(value.value).toBe("custom-value");
	});
});
