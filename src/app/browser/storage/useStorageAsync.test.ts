import { describe, expect, it, beforeEach, vi } from "vitest";
import { useStorageAsync } from "./useStorageAsync";

describe("useStorageAsync", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	it("should initialize with default value", async () => {
		const { data } = useStorageAsync("test-key", "default");

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(data.value).toBe("default");
	});

	it("should read existing value from storage", async () => {
		localStorage.setItem("test-key", JSON.stringify("existing"));

		const { data } = useStorageAsync("test-key", "default");

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(data.value).toBe("existing");
	});

	it("should write value to storage", async () => {
		const { write } = useStorageAsync("test-key", "default");

		await write("updated");

		expect(localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
	});

	it("should remove value from storage", async () => {
		const { remove } = useStorageAsync("test-key", "default");

		await remove();

		expect(localStorage.getItem("test-key")).toBeNull();
	});

	it("should set loading state during operations", async () => {
		const { isLoading, write } = useStorageAsync("test-key", "default");

		const promise = write("test");

		expect(isLoading.value).toBe(true);

		await promise;

		expect(isLoading.value).toBe(false);
	});

	it("should handle read error", async () => {
		const mockError = new Error("Storage error");
		vi.spyOn(localStorage, "getItem").mockImplementation(() => {
			throw mockError;
		});

		const { error } = useStorageAsync("test-key", "default");

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(error.value).toBe(mockError);
	});

	it("should handle write error", async () => {
		const mockError = new Error("Storage error");
		vi.spyOn(localStorage, "setItem").mockImplementation(() => {
			throw mockError;
		});

		const { write, error } = useStorageAsync("test-key", "default");

		await write("test");

		expect(error.value).toBe(mockError);
	});

	it("should handle remove error", async () => {
		const mockError = new Error("Storage error");
		vi.spyOn(localStorage, "removeItem").mockImplementation(() => {
			throw mockError;
		});

		const { remove, error } = useStorageAsync("test-key", "default");

		await remove();

		expect(error.value).toBe(mockError);
	});

	it("should work with complex objects", async () => {
		const obj = { name: "test", value: 123 };
		const { data, write } = useStorageAsync("test-key", obj);

		await write(obj);

		expect(data.value).toEqual(obj);
	});

	it("should work with arrays", async () => {
		const arr = [1, 2, 3];
		const { data, write } = useStorageAsync("test-key", arr);

		await write(arr);

		expect(data.value).toEqual(arr);
	});

	it("should use custom serializer", async () => {
		const customSerializer = {
			read: (v: string) => v.toUpperCase(),
			write: (v: string) => v.toLowerCase(),
		};

		const { write, data } = useStorageAsync("test-key", "DEFAULT", {
			serializer: customSerializer,
		});

		await write("TEST");

		expect(data.value).toBe("TEST");
		expect(localStorage.getItem("test-key")).toBe("test");
	});

	it("should provide read function", () => {
		const { read } = useStorageAsync("test-key", "default");

		expect(read).toBeDefined();
		expect(typeof read).toBe("function");
	});

	it("should provide write function", () => {
		const { write } = useStorageAsync("test-key", "default");

		expect(write).toBeDefined();
		expect(typeof write).toBe("function");
	});

	it("should provide remove function", () => {
		const { remove } = useStorageAsync("test-key", "default");

		expect(remove).toBeDefined();
		expect(typeof remove).toBe("function");
	});
});
