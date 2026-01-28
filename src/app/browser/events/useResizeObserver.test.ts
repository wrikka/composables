import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useResizeObserver } from "./useResizeObserver";

describe("useResizeObserver", () => {
	it("should initialize with resize observer", () => {
		const target = ref(document.createElement("div"));
		const result = useResizeObserver(target);

		expect(result).toBeDefined();
		expect(result.stop).toBeDefined();
		expect(result.start).toBeDefined();
	});

	it("should accept HTML element", () => {
		const target = document.createElement("div");
		const result = useResizeObserver(target);

		expect(result).toBeDefined();
	});

	it("should accept ref", () => {
		const target = ref(document.createElement("div"));
		const result = useResizeObserver(target);

		expect(result).toBeDefined();
	});

	it("should accept custom options", () => {
		const target = ref(document.createElement("div"));
		const result = useResizeObserver(target, {
			window: false,
			deep: true,
		});

		expect(result).toBeDefined();
	});

	it("should provide stop function", () => {
		const target = ref(document.createElement("div"));
		const { stop } = useResizeObserver(target);

		expect(typeof stop).toBe("function");
	});

	it("should provide start function", () => {
		const target = ref(document.createElement("div"));
		const { start } = useResizeObserver(target);

		expect(typeof start).toBe("function");
	});
});
