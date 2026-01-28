import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useElementVisibility } from "./useElementVisibility";

describe("useElementVisibility", () => {
	it("should initialize with false values", () => {
		const target = ref(document.createElement("div"));
		const { isVisible, isIntersecting, intersectionRatio } = useElementVisibility(target);

		expect(isVisible.value).toBe(false);
		expect(isIntersecting.value).toBe(false);
		expect(intersectionRatio.value).toBe(0);
	});

	it("should accept HTML element", () => {
		const target = document.createElement("div");
		const result = useElementVisibility(target);

		expect(result).toBeDefined();
		expect(result.isVisible).toBeDefined();
		expect(result.isIntersecting).toBeDefined();
		expect(result.intersectionRatio).toBeDefined();
	});

	it("should accept ref", () => {
		const target = ref(document.createElement("div"));
		const result = useElementVisibility(target);

		expect(result).toBeDefined();
		expect(result.isVisible).toBeDefined();
		expect(result.isIntersecting).toBeDefined();
		expect(result.intersectionRatio).toBeDefined();
	});

	it("should accept custom options", () => {
		const target = ref(document.createElement("div"));
		const result = useElementVisibility(target, {
			threshold: 0.5,
			rootMargin: "10px",
		});

		expect(result).toBeDefined();
	});

	it("should provide stop function", () => {
		const target = ref(document.createElement("div"));
		const { stop } = useElementVisibility(target);

		expect(stop).toBeDefined();
		expect(typeof stop).toBe("function");
	});

	it("should provide start function", () => {
		const target = ref(document.createElement("div"));
		const { start } = useElementVisibility(target);

		expect(start).toBeDefined();
		expect(typeof start).toBe("function");
	});
});
