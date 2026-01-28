import { describe, it, expect, beforeEach } from "vitest";
import { useKeyboard } from "./useKeyboard";

describe("useKeyboard", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("should initialize with default values", () => {
		const { isPressed, key, code, ctrl, shift, alt, meta } = useKeyboard();

		expect(isPressed.value).toBe(false);
		expect(key.value).toBe(null);
		expect(code.value).toBe(null);
		expect(ctrl.value).toBe(false);
		expect(shift.value).toBe(false);
		expect(alt.value).toBe(false);
		expect(meta.value).toBe(false);
	});

	it("should update state on keydown", () => {
		const { isPressed, key, code, ctrl } = useKeyboard();

		const event = new KeyboardEvent("keydown", {
			key: "Enter",
			code: "Enter",
			ctrlKey: true,
		});
		window.dispatchEvent(event);

		expect(isPressed.value).toBe(true);
		expect(key.value).toBe("Enter");
		expect(code.value).toBe("Enter");
		expect(ctrl.value).toBe(true);
	});

	it("should reset state on keyup", () => {
		const { isPressed, key, code, ctrl } = useKeyboard();

		const downEvent = new KeyboardEvent("keydown", {
			key: "Enter",
			code: "Enter",
			ctrlKey: true,
		});
		window.dispatchEvent(downEvent);

		expect(isPressed.value).toBe(true);

		const upEvent = new KeyboardEvent("keyup");
		window.dispatchEvent(upEvent);

		expect(isPressed.value).toBe(false);
		expect(key.value).toBe(null);
		expect(code.value).toBe(null);
		expect(ctrl.value).toBe(false);
	});
});
