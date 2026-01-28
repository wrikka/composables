import { beforeEach, describe, expect, it } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

describe("useLocalStorage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("should get initial value and set it in localStorage", () => {
		const key = "test-key";
		const initialValue = "test-value";
		const value = useLocalStorage(key, initialValue);

		expect(value.value).toBe(initialValue);
		expect(localStorage.getItem(key)).toBe(JSON.stringify(initialValue));
	});

	it("should get existing value from localStorage", () => {
		const key = "test-key";
		const existingValue = { a: 1 };
		localStorage.setItem(key, JSON.stringify(existingValue));

		const value = useLocalStorage(key, { a: 2 });
		expect(value.value).toEqual(existingValue);
	});

	it("should update localStorage when value changes", () => {
		const key = "test-key";
		const value = useLocalStorage(key, "initial");

		value.value = "updated";
		expect(localStorage.getItem(key)).toBe(JSON.stringify("updated"));
	});
});
