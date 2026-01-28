import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useSwipe } from "./useSwipe";

describe("useSwipe", () => {
	it("should initialize with swipe state", () => {
		const target = ref(document.createElement("div"));
		const result = useSwipe(target);

		expect(result).toBeDefined();
		expect(result.lengthX).toBeDefined();
		expect(result.lengthY).toBeDefined();
		expect(result.direction).toBeDefined();
	});

	it("should accept HTML element", () => {
		const target = document.createElement("div");
		const result = useSwipe(target);

		expect(result).toBeDefined();
	});

	it("should accept ref", () => {
		const target = ref(document.createElement("div"));
		const result = useSwipe(target);

		expect(result).toBeDefined();
	});

	it("should accept custom options", () => {
		const target = ref(document.createElement("div"));
		const result = useSwipe(target, {
			passive: true,
		});

		expect(result).toBeDefined();
	});

	it("should provide swipe direction", () => {
		const target = ref(document.createElement("div"));
		const { direction } = useSwipe(target);

		expect(direction.value).toBe("UP" || "DOWN" || "LEFT" || "RIGHT" || null);
	});

	it("should provide swipe length", () => {
		const target = ref(document.createElement("div"));
		const { lengthX, lengthY } = useSwipe(target);

		expect(typeof lengthX.value).toBe("number");
		expect(typeof lengthY.value).toBe("number");
	});
});
