import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useFocus } from "./useFocus";

describe("useFocus", () => {
	it("should initialize with focus state", () => {
		const target = ref(document.createElement("input"));
		const result = useFocus(target);

		expect(result).toBeDefined();
		expect(result.focused).toBeDefined();
	});

	it("should accept HTML element", () => {
		const target = document.createElement("input");
		const result = useFocus(target);

		expect(result).toBeDefined();
		expect(result.focused).toBeDefined();
	});

	it("should accept ref", () => {
		const target = ref(document.createElement("input"));
		const result = useFocus(target);

		expect(result).toBeDefined();
		expect(result.focused).toBeDefined();
	});

	it("should accept custom options", () => {
		const target = ref(document.createElement("input"));
		const result = useFocus(target, {
			initialValue: true,
		});

		expect(result).toBeDefined();
	});

	it("should provide focus function", () => {
		const target = ref(document.createElement("input"));
		const { focus } = useFocus(target);

		expect(focus).toBeDefined();
		expect(typeof focus).toBe("function");
	});

	it("should provide blur function", () => {
		const target = ref(document.createElement("input"));
		const { blur } = useFocus(target);

		expect(blur).toBeDefined();
		expect(typeof blur).toBe("function");
	});
});
