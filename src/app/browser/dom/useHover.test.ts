import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useHover } from "./useHover";

describe("useHover", () => {
	it("should initialize with hover state", () => {
		const target = ref(document.createElement("div"));
		const result = useHover(target);

		expect(result).toBeDefined();
		expect(result.isHovered).toBeDefined();
	});

	it("should accept HTML element", () => {
		const target = document.createElement("div");
		const result = useHover(target);

		expect(result).toBeDefined();
		expect(result.isHovered).toBeDefined();
	});

	it("should accept ref", () => {
		const target = ref(document.createElement("div"));
		const result = useHover(target);

		expect(result).toBeDefined();
		expect(result.isHovered).toBeDefined();
	});

	it("should return reactive boolean", () => {
		const target = ref(document.createElement("div"));
		const { isHovered } = useHover(target);

		expect(typeof isHovered.value).toBe("boolean");
	});
});
