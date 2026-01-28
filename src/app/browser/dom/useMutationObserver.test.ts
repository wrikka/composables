import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useMutationObserver } from "./useMutationObserver";

describe("useMutationObserver", () => {
	it("should initialize with observer", () => {
		const target = ref(document.createElement("div"));
		const callback = vi.fn();

		const result = useMutationObserver(target, callback);

		expect(result).toBeDefined();
	});

	it("should accept HTML element", () => {
		const target = document.createElement("div");
		const callback = vi.fn();

		const result = useMutationObserver(target, callback);

		expect(result).toBeDefined();
	});

	it("should accept ref", () => {
		const target = ref(document.createElement("div"));
		const callback = vi.fn();

		const result = useMutationObserver(target, callback);

		expect(result).toBeDefined();
	});

	it("should accept options", () => {
		const target = ref(document.createElement("div"));
		const callback = vi.fn();

		const result = useMutationObserver(target, callback, {
			childList: true,
			attributes: true,
		});

		expect(result).toBeDefined();
	});

	it("should provide stop function", () => {
		const target = ref(document.createElement("div"));
		const callback = vi.fn();

		const { stop } = useMutationObserver(target, callback);

		expect(stop).toBeDefined();
		expect(typeof stop).toBe("function");
	});

	it("should provide start function", () => {
		const target = ref(document.createElement("div"));
		const callback = vi.fn();

		const { start } = useMutationObserver(target, callback);

		expect(start).toBeDefined();
		expect(typeof start).toBe("function");
	});
});
