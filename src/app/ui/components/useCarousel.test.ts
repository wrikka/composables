import { describe, it, expect, beforeEach } from "vitest";
import { useCarousel } from "./useCarousel";

describe("useCarousel", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("should initialize with first item active", () => {
		const items = ["item1", "item2", "item3"];
		const { activeIndex, activeItem } = useCarousel(items);

		expect(activeIndex.value).toBe(0);
		expect(activeItem.value).toBe("item1");
	});

	it("should go to next item", () => {
		const items = ["item1", "item2", "item3"];
		const { activeIndex, next } = useCarousel(items);

		next();
		expect(activeIndex.value).toBe(1);

		next();
		expect(activeIndex.value).toBe(2);
	});

	it("should go to previous item", () => {
		const items = ["item1", "item2", "item3"];
		const { activeIndex, next, prev } = useCarousel(items);

		next();
		next();
		expect(activeIndex.value).toBe(2);

		prev();
		expect(activeIndex.value).toBe(1);
	});

	it("should loop to first item when going next from last", () => {
		const items = ["item1", "item2", "item3"];
		const { activeIndex, next } = useCarousel(items, { loop: true });

		next();
		next();
		next();
		expect(activeIndex.value).toBe(0);
	});

	it("should loop to last item when going prev from first", () => {
		const items = ["item1", "item2", "item3"];
		const { activeIndex, prev } = useCarousel(items, { loop: true });

		prev();
		expect(activeIndex.value).toBe(2);
	});

	it("should not loop when loop is false", () => {
		const items = ["item1", "item2", "item3"];
		const { activeIndex, next, prev } = useCarousel(items, { loop: false });

		expect(activeIndex.value).toBe(0);

		prev();
		expect(activeIndex.value).toBe(0);

		next();
		next();
		next();
		expect(activeIndex.value).toBe(2);
	});

	it("should go to specific item", () => {
		const items = ["item1", "item2", "item3"];
		const { activeIndex, goTo } = useCarousel(items);

		goTo(1);
		expect(activeIndex.value).toBe(1);

		goTo(2);
		expect(activeIndex.value).toBe(2);
	});

	it("should check if is first item", () => {
		const items = ["item1", "item2", "item3"];
		const { isFirst, next } = useCarousel(items);

		expect(isFirst.value).toBe(true);

		next();
		expect(isFirst.value).toBe(false);
	});

	it("should check if is last item", () => {
		const items = ["item1", "item2", "item3"];
		const { isLast, next } = useCarousel(items);

		expect(isLast.value).toBe(false);

		next();
		next();
		expect(isLast.value).toBe(true);
	});

	it("should reset to first item", () => {
		const items = ["item1", "item2", "item3"];
		const { activeIndex, next, reset } = useCarousel(items);

		next();
		next();
		expect(activeIndex.value).toBe(2);

		reset();
		expect(activeIndex.value).toBe(0);
	});

	it("should handle empty items array", () => {
		const items: string[] = [];
		const { activeIndex, activeItem } = useCarousel(items);

		expect(activeIndex.value).toBe(-1);
		expect(activeItem.value).toBe(null);
	});
});
