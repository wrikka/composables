import { describe, expect, it, beforeEach } from "vitest";
import { useStorage } from "./useStorage";

describe("useStorage", () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});

	it("should initialize with default value", () => {
		const data = useStorage("test-key", "default", localStorage);

		expect(data.value).toBe("default");
	});

	it("should read existing value from storage", () => {
		localStorage.setItem("test-key", JSON.stringify("existing"));

		const data = useStorage("test-key", "default", localStorage);

		expect(data.value).toBe("existing");
	});

	it("should write default value to storage", () => {
		useStorage("test-key", "default", localStorage);

		expect(localStorage.getItem("test-key")).toBe(JSON.stringify("default"));
	});

	it("should not write default value when writeDefaults is false", () => {
		useStorage("test-key", "default", localStorage, { writeDefaults: false });

		expect(localStorage.getItem("test-key")).toBeNull();
	});

	it("should update storage when value changes", () => {
		const data = useStorage("test-key", "default", localStorage);

		data.value = "updated";

		expect(localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
	});

	it("should remove item from storage when value is null", () => {
		const data = useStorage("test-key", "default", localStorage);

		data.value = null;

		expect(localStorage.getItem("test-key")).toBeNull();
	});

	it("should remove item from storage when value is undefined", () => {
		const data = useStorage("test-key", "default", localStorage);

		data.value = undefined;

		expect(localStorage.getItem("test-key")).toBeNull();
	});

	it("should work with complex objects", () => {
		const obj = { name: "test", value: 123 };
		const data = useStorage("test-key", obj, localStorage);

		expect(data.value).toEqual(obj);
	});

	it("should work with arrays", () => {
		const arr = [1, 2, 3];
		const data = useStorage("test-key", arr, localStorage);

		expect(data.value).toEqual(arr);
	});

	it("should work with sessionStorage", () => {
		const data = useStorage("test-key", "default", sessionStorage);

		expect(sessionStorage.getItem("test-key")).toBe(JSON.stringify("default"));
	});

	it("should handle undefined storage gracefully", () => {
		const data = useStorage("test-key", "default", undefined);

		expect(data.value).toBe("default");
	});

	it("should handle invalid JSON in storage", () => {
		localStorage.setItem("test-key", "invalid json");

		const data = useStorage("test-key", "default", localStorage);

		expect(data.value).toBe("default");
	});

	it("should use custom serializer", () => {
		const customSerializer = {
			read: (v: string) => v.toUpperCase(),
			write: (v: string) => v.toLowerCase(),
		};

		const data = useStorage("test-key", "DEFAULT", localStorage, {
			serializer: customSerializer,
		});

		expect(data.value).toBe("DEFAULT");
		expect(localStorage.getItem("test-key")).toBe("default");
	});
});
