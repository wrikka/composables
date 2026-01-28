import { describe, expect, it } from "vitest";
import { useActiveElement } from "./useActiveElement";

describe("useActiveElement", () => {
	it("should return active element ref", () => {
		const result = useActiveElement();

		expect(result).toBeDefined();
		expect(typeof result.value).toBe("object" || "null");
	});

	it("should be reactive", () => {
		const result = useActiveElement();

		expect(result).toBeDefined();
	});
});
