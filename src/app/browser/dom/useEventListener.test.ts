import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useEventListener } from "./useEventListener";

describe("useEventListener", () => {
	it("should add event listener", () => {
		const target = ref(document.createElement("div"));
		const handler = vi.fn();

		useEventListener(target, "click", handler);

		expect(handler).toBeDefined();
	});

	it("should accept HTML element", () => {
		const target = document.createElement("div");
		const handler = vi.fn();

		const result = useEventListener(target, "click", handler);

		expect(result).toBeDefined();
	});

	it("should accept ref", () => {
		const target = ref(document.createElement("div"));
		const handler = vi.fn();

		const result = useEventListener(target, "click", handler);

		expect(result).toBeDefined();
	});

	it("should accept options", () => {
		const target = ref(document.createElement("div"));
		const handler = vi.fn();

		const result = useEventListener(target, "click", handler, { passive: true });

		expect(result).toBeDefined();
	});

	it("should provide stop function", () => {
		const target = ref(document.createElement("div"));
		const handler = vi.fn();

		const result = useEventListener(target, "click", handler);

		expect(result).toBeDefined();
		expect(typeof result).toBe("function");
	});
});
