import { describe, expect, it, beforeEach, vi } from "vitest";
import { useStorageWatcher } from "./useStorageWatcher";

describe("useStorageWatcher", () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
		vi.clearAllMocks();
	});

	it("should initialize with storage value", () => {
		localStorage.setItem("test-key", "test-value");

		const { value } = useStorageWatcher("test-key");

		expect(value.value).toBe("test-value");
	});

	it("should initialize with null when key does not exist", () => {
		const { value } = useStorageWatcher("test-key");

		expect(value.value).toBeNull();
	});

	it("should update value when storage changes", () => {
		const { value } = useStorageWatcher("test-key");

		window.dispatchEvent(
			new StorageEvent("storage", {
				key: "test-key",
				newValue: "updated-value",
			}),
		);

		expect(value.value).toBe("updated-value");
	});

	it("should ignore storage changes for different keys", () => {
		const { value } = useStorageWatcher("test-key");

		window.dispatchEvent(
			new StorageEvent("storage", {
				key: "other-key",
				newValue: "updated-value",
			}),
		);

		expect(value.value).toBeNull();
	});

	it("should work with sessionStorage", () => {
		sessionStorage.setItem("test-key", "test-value");

		const { value } = useStorageWatcher("test-key", {
			storage: sessionStorage,
		});

		expect(value.value).toBe("test-value");
	});

	it("should handle read error", () => {
		const mockError = new Error("Storage error");
		vi.spyOn(localStorage, "getItem").mockImplementation(() => {
			throw mockError;
		});

		const { error } = useStorageWatcher("test-key");

		expect(error.value).toBe(mockError);
	});

	it("should provide read function", () => {
		const { read } = useStorageWatcher("test-key");

		expect(read).toBeDefined();
		expect(typeof read).toBe("function");
	});

	it("should read value on read call", () => {
		const { value, read } = useStorageWatcher("test-key");

		localStorage.setItem("test-key", "new-value");

		read();

		expect(value.value).toBe("new-value");
	});

	it("should handle null newValue in storage event", () => {
		const { value } = useStorageWatcher("test-key");

		localStorage.setItem("test-key", "test-value");

		window.dispatchEvent(
			new StorageEvent("storage", {
				key: "test-key",
				newValue: null,
			}),
		);

		expect(value.value).toBeNull();
	});

	it("should provide reactive value", () => {
		const { value } = useStorageWatcher("test-key");

		expect(typeof value.value).toBe("string" || "null");
	});

	it("should provide error ref", () => {
		const { error } = useStorageWatcher("test-key");

		expect(error.value).toBeNull();
	});
});
