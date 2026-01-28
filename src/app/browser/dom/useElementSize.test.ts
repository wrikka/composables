import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useElementSize } from "./useElementSize";

describe("useElementSize", () => {
	it("should initialize with zero values", () => {
		const target = ref(document.createElement("div"));
		const { width, height, top, left, right, bottom, x, y } = useElementSize(target);

		expect(width.value).toBe(0);
		expect(height.value).toBe(0);
		expect(top.value).toBe(0);
		expect(left.value).toBe(0);
		expect(right.value).toBe(0);
		expect(bottom.value).toBe(0);
		expect(x.value).toBe(0);
		expect(y.value).toBe(0);
	});

	it("should accept HTML element", () => {
		const target = document.createElement("div");
		const result = useElementSize(target);

		expect(result).toBeDefined();
		expect(result.width).toBeDefined();
		expect(result.height).toBeDefined();
	});

	it("should accept ref", () => {
		const target = ref(document.createElement("div"));
		const result = useElementSize(target);

		expect(result).toBeDefined();
		expect(result.width).toBeDefined();
		expect(result.height).toBeDefined();
	});

	it("should provide stop function", () => {
		const target = ref(document.createElement("div"));
		const { stop } = useElementSize(target);

		expect(stop).toBeDefined();
		expect(typeof stop).toBe("function");
	});

	it("should provide start function", () => {
		const target = ref(document.createElement("div"));
		const { start } = useElementSize(target);

		expect(start).toBeDefined();
		expect(typeof start).toBe("function");
	});
});
