import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useDraggable } from "./useDraggable";

describe("useDraggable", () => {
	it("should initialize with draggable state", () => {
		const target = ref(document.createElement("div"));
		const result = useDraggable(target);

		expect(result).toBeDefined();
		expect(result.x).toBeDefined();
		expect(result.y).toBeDefined();
		expect(result.isDragging).toBeDefined();
	});

	it("should accept HTML element", () => {
		const target = document.createElement("div");
		const result = useDraggable(target);

		expect(result).toBeDefined();
	});

	it("should accept ref", () => {
		const target = ref(document.createElement("div"));
		const result = useDraggable(target);

		expect(result).toBeDefined();
	});

	it("should accept custom options", () => {
		const target = ref(document.createElement("div"));
		const result = useDraggable(target, {
			exact: true,
			preventDefault: true,
			disabled: false,
		});

		expect(result).toBeDefined();
	});

	it("should provide position values", () => {
		const target = ref(document.createElement("div"));
		const { x, y } = useDraggable(target);

		expect(x.value).toBe(0);
		expect(y.value).toBe(0);
	});
});
