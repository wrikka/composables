import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useLongPress } from "./useLongPress";

describe("useLongPress", () => {
	it("should initialize with long press state", () => {
		const target = ref(document.createElement("div"));
		const result = useLongPress(target);

		expect(result).toBeDefined();
		expect(result.isPressed).toBeDefined();
	});

	it("should accept HTML element", () => {
		const target = document.createElement("div");
		const result = useLongPress(target);

		expect(result).toBeDefined();
	});

	it("should accept ref", () => {
		const target = ref(document.createElement("div"));
		const result = useLongPress(target);

		expect(result).toBeDefined();
	});

	it("should accept custom options", () => {
		const target = ref(document.createElement("div"));
		const result = useLongPress(target, {
			delay: 500,
			modifiers: ["prevent"],
		});

		expect(result).toBeDefined();
	});

	it("should provide pressed state", () => {
		const target = ref(document.createElement("div"));
		const { isPressed } = useLongPress(target);

		expect(typeof isPressed.value).toBe("boolean");
	});
});
