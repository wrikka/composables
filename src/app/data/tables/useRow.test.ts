import { describe, expect, it } from "vitest";
import { useRow } from "./useRow";

describe("useRow", () => {
	const item = { id: 1, name: "Test" };

	it("should initialize with default values", () => {
		const { isHovered, isExpanded } = useRow(item);
		expect(isHovered.value).toBe(false);
		expect(isExpanded.value).toBe(false);
	});

	it("should update isHovered on mouse events", () => {
		const { isHovered, onMouseover, onMouseleave } = useRow(item);
		onMouseover();
		expect(isHovered.value).toBe(true);
		onMouseleave();
		expect(isHovered.value).toBe(false);
	});

	it("should toggle isExpanded", () => {
		const { isExpanded, toggleExpand } = useRow(item);
		toggleExpand();
		expect(isExpanded.value).toBe(true);
		toggleExpand();
		expect(isExpanded.value).toBe(false);
	});

	it("should compute rowClasses correctly", () => {
		const { rowClasses, onMouseover, onMouseleave, toggleExpand } =
			useRow(item);
		expect(rowClasses.value).toEqual({ hover: false, expanded: false });
		onMouseover();
		expect(rowClasses.value).toEqual({ hover: true, expanded: false });
		toggleExpand();
		expect(rowClasses.value).toEqual({ hover: true, expanded: true });
		onMouseleave();
		expect(rowClasses.value).toEqual({ hover: false, expanded: true });
	});
});
