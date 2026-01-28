import { describe, expect, it, beforeEach, vi } from "vitest";
import { useStorageSync } from "./useStorageSync";

describe("useStorageSync", () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
		vi.clearAllMocks();
	});

	it("should initialize with default value", () => {
		const { data } = useStorageSync("test-key", "default");

		expect(data.value).toBe("default");
	});

	it("should read existing value from storage", () => {
		localStorage.setItem("test-key", JSON.stringify("existing"));

		const { data } = useStorageSync("test-key", "default");

		expect(data.value).toBe("existing");
	});

	it("should write value to storage", () => {
		const { data, write } = useStorageSync("test-key", "default");

		data.value = "updated";

		expect(localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
	});

	it("should work with sessionStorage", () => {
		const { data } = useStorageSync("test-key", "default", {
			storage: sessionStorage,
		});

		expect(sessionStorage.getItem("test-key")).toBe(JSON.stringify("default"));
	});

	it("should handle read error", () => {
		const mockError = new Error("Storage error");
		vi.spyOn(localStorage, "getItem").mockImplementation(() => {
			throw mockError;
		});

		const { error } = useStorageSync("test-key", "default");

		expect(error.value).toBe(mockError);
	});

	it("should handle write error", () => {
		const mockError = new Error("Storage error");
		vi.spyOn(localStorage, "setItem").mockImplementation(() => {
			throw mockError;
		});

		const { data, error } = useStorageSync("test-key", "default");

		data.value = "test";

		expect(error.value).toBe(mockError);
	});

	it("should work with complex objects", () => {
		const obj = { name: "test", value: 123 };
		const { data } = useStorageSync("test-key", obj);

		expect(data.value).toEqual(obj);
	});

	it("should work with arrays", () => {
		const arr = [1, 2, 3];
		const { data } = useStorageSync("test-key", arr);

		expect(data.value).toEqual(arr);
	});

	it("should use custom serializer", () => {
		const customSerializer = {
			read: (v: string) => v.toUpperCase(),
			write: (v: string) => v.toLowerCase(),
		};

		const { data } = useStorageSync("test-key", "DEFAULT", {
			serializer: customSerializer,
		});

		data.value = "TEST";

		expect(localStorage.getItem("test-key")).toBe("test");
	});

	it("should listen for storage changes", () => {
		const { data } = useStorageSync("test-key", "default");

		window.dispatchEvent(
			new StorageEvent("storage", {
				key: "test-key",
				newValue: JSON.stringify("updated"),
			}),
		);

		expect(data.value).toBe("updated");
	});

	it("should ignore storage changes for different keys", () => {
		const { data } = useStorageSync("test-key", "default");

		window.dispatchEvent(
			new StorageEvent("storage", {
				key: "other-key",
				newValue: JSON.stringify("updated"),
			}),
		);

		expect(data.value).toBe("default");
	});

	it("should provide read function", () => {
		const { read } = useStorageSync("test-key", "default");

		expect(read).toBeDefined();
		expect(typeof read).toBe("function");
	});

	it("should provide write function", () => {
		const { write } = useStorageSync("test-key", "default");

		expect(write).toBeDefined();
		expect(typeof write).toBe("function");
	});

	it("should work with deep option", () => {
		const obj = { nested: { value: 123 } };
		const { data } = useStorageSync("test-key", obj, { deep: true });

		data.value.nested.value = 456;

		expect(localStorage.getItem("test-key")).toBe(JSON.stringify({ nested: { value: 456 } }));
	});
});
