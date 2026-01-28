import { describe, expect, it } from "vitest";
import { useMouse } from "./useMouse";

describe("useMouse", () => {
	it("should initialize with mouse position", () => {
		const result = useMouse();

		expect(result).toBeDefined();
		expect(result.x).toBeDefined();
		expect(result.y).toBeDefined();
		expect(result.sourceType).toBeDefined();
	});

	it("should accept custom options", () => {
		const result = useMouse({
			type: "client",
			touch: true,
			resetOnTouchEnds: true,
		});

		expect(result).toBeDefined();
	});

	it("should provide position values", () => {
		const { x, y } = useMouse();

		expect(typeof x.value).toBe("number");
		expect(typeof y.value).toBe("number");
	});

	it("should provide source type", () => {
		const { sourceType } = useMouse();

		expect(sourceType.value).toBe("mouse" || "touch" || null);
	});
});
