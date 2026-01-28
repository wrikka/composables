import { describe, it, expect } from "vitest";
import { useAccordion } from "./useAccordion";

describe("useAccordion", () => {
	it("should initialize with empty open items", () => {
		const { openItems, toggle: _toggle } = useAccordion([]);

		expect(openItems.value.size).toBe(0);
	});

	it("should toggle item open/close", () => {
		const { isOpen, toggle } = useAccordion(["item1", "item2"]);

		expect(isOpen("item1")).toBe(false);

		toggle("item1");
		expect(isOpen("item1")).toBe(true);

		toggle("item1");
		expect(isOpen("item1")).toBe(false);
	});

	it("should open item", () => {
		const { isOpen, open } = useAccordion(["item1"]);

		expect(isOpen("item1")).toBe(false);

		open("item1");
		expect(isOpen("item1")).toBe(true);
	});

	it("should close item", () => {
		const { isOpen, open, close } = useAccordion(["item1"]);

		open("item1");
		expect(isOpen("item1")).toBe(true);

		close("item1");
		expect(isOpen("item1")).toBe(false);
	});

	it("should close all items", () => {
		const { isOpen, open, closeAll } = useAccordion(["item1", "item2"]);

		open("item1");
		open("item2");
		expect(isOpen("item1")).toBe(true);
		expect(isOpen("item2")).toBe(true);

		closeAll();
		expect(isOpen("item1")).toBe(false);
		expect(isOpen("item2")).toBe(false);
	});

	it("should open all items", () => {
		const { isOpen, openAll } = useAccordion(["item1", "item2"]);

		openAll();
		expect(isOpen("item1")).toBe(true);
		expect(isOpen("item2")).toBe(true);
	});

	it("should check if all items are open", () => {
		const { openAll, isOpenAll } = useAccordion(["item1", "item2"]);

		openAll();
		expect(isOpenAll()).toBe(true);
	});

	it("should check if all items are open", () => {
		const { isOpen: _isOpen, openAll, isOpenAll } = useAccordion(["item1", "item2"]);

		expect(isOpenAll()).toBe(false);

		openAll();
		expect(isOpenAll()).toBe(true);
	});

	it("should use custom key function", () => {
		const items = [{ id: 1 }, { id: 2 }];
		const { isOpen, toggle } = useAccordion(items, (item) => String(item.id));

		expect(isOpen(items[0])).toBe(false);

		toggle(items[0]);
		expect(isOpen(items[0])).toBe(true);
	});

	it("should track active item", () => {
		const { isActive, toggle } = useAccordion(["item1", "item2"]);

		expect(isActive("item1")).toBe(false);

		toggle("item1");
		expect(isActive("item1")).toBe(true);

		toggle("item2");
		expect(isActive("item1")).toBe(false);
		expect(isActive("item2")).toBe(true);
	});
});
