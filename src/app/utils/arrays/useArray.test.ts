import { beforeEach, describe, expect, it } from "vitest";
import { useArray } from "./useArray";

describe("useArray", () => {
	beforeEach(() => {
		// Reset before each test
	});

	it("should initialize with empty array", () => {
		const { array, length, isEmpty } = useArray();
		expect(array.value).toEqual([]);
		expect(length.value).toBe(0);
		expect(isEmpty.value).toBe(true);
	});

	it("should initialize with initial values", () => {
		const initial = [1, 2, 3];
		const { array, length, isEmpty } = useArray({ initial });
		expect(array.value).toEqual(initial);
		expect(length.value).toBe(3);
		expect(isEmpty.value).toBe(false);
	});

	it("should add item to array", () => {
		const { array, add } = useArray();
		add(1);
		add(2);
		expect(array.value).toEqual([1, 2]);
	});

	it("should add item at specific index", () => {
		const { array, addAt } = useArray({ initial: [1, 3] });
		addAt(2, 1);
		expect(array.value).toEqual([1, 2, 3]);
	});

	it("should remove item from array", () => {
		const { array, remove } = useArray({ initial: [1, 2, 3] });
		remove(2);
		expect(array.value).toEqual([1, 3]);
	});

	it("should remove item at specific index", () => {
		const { array, removeAt } = useArray({ initial: [1, 2, 3] });
		removeAt(1);
		expect(array.value).toEqual([1, 3]);
	});

	it("should clear array", () => {
		const { array, clear, isEmpty } = useArray({ initial: [1, 2, 3] });
		clear();
		expect(array.value).toEqual([]);
		expect(isEmpty.value).toBe(true);
	});

	it("should reset array to initial values", () => {
		const { array, add, reset } = useArray({ initial: [1, 2, 3] });
		add(4);
		add(5);
		expect(array.value).toEqual([1, 2, 3, 4, 5]);
		reset();
		expect(array.value).toEqual([1, 2, 3]);
	});

	it("should find item matching predicate", () => {
		const { find } = useArray({ initial: [1, 2, 3, 4, 5] });
		const result = find((item) => item > 3);
		expect(result).toBe(4);
	});

	it("should filter items", () => {
		const { filter } = useArray({ initial: [1, 2, 3, 4, 5] });
		const result = filter((item) => item % 2 === 0);
		expect(result).toEqual([2, 4]);
	});

	it("should map items", () => {
		const { map } = useArray({ initial: [1, 2, 3] });
		const result = map((item) => item * 2);
		expect(result).toEqual([2, 4, 6]);
	});

	it("should reduce items", () => {
		const { reduce } = useArray({ initial: [1, 2, 3] });
		const result = reduce((acc, item) => acc + item, 0);
		expect(result).toBe(6);
	});

	it("should check if some items match predicate", () => {
		const { some } = useArray({ initial: [1, 2, 3] });
		expect(some((item) => item > 2)).toBe(true);
		expect(some((item) => item > 5)).toBe(false);
	});

	it("should check if every item matches predicate", () => {
		const { every } = useArray({ initial: [2, 4, 6] });
		expect(every((item) => item % 2 === 0)).toBe(true);
		expect(every((item) => item > 4)).toBe(false);
	});

	it("should check if array includes item", () => {
		const { includes } = useArray({ initial: [1, 2, 3] });
		expect(includes(2)).toBe(true);
		expect(includes(5)).toBe(false);
	});

	it("should get index of item", () => {
		const { indexOf } = useArray({ initial: [1, 2, 3] });
		expect(indexOf(2)).toBe(1);
		expect(indexOf(5)).toBe(-1);
	});

	it("should join array items", () => {
		const { join } = useArray({ initial: [1, 2, 3] });
		expect(join()).toBe("1,2,3");
		expect(join("-")).toBe("1-2-3");
	});

	it("should reverse array", () => {
		const { array, reverse } = useArray({ initial: [1, 2, 3] });
		reverse();
		expect(array.value).toEqual([3, 2, 1]);
	});

	it("should sort array", () => {
		const { array, sort } = useArray({ initial: [3, 1, 4, 1, 5, 9] });
		sort();
		expect(array.value).toEqual([1, 1, 3, 4, 5, 9]);
	});

	it("should shuffle array", () => {
		const { shuffle, array } = useArray({ initial: [1, 2, 3, 4, 5] });
		const original = [...array.value];
		shuffle();
		// Should still contain same items but in different order
		expect(array.value).toEqual(expect.arrayContaining(original));
		expect(array.value).not.toEqual(original);
	});

	it("should slice array", () => {
		const { slice } = useArray({ initial: [1, 2, 3, 4, 5] });
		const result = slice(1, 3);
		expect(result).toEqual([2, 3]);
	});

	it("should concat arrays", () => {
		const { concat } = useArray({ initial: [1, 2] });
		const result = concat([3, 4], [5]);
		expect(result).toEqual([1, 2, 3, 4, 5]);
	});

	it("should get unique items", () => {
		const { unique, array } = useArray({ initial: [1, 2, 2, 3, 3, 3, 4] });
		unique();
		expect(array.value).toEqual([1, 2, 3, 4]);
	});

	it("should clone array", () => {
		const { clone, array } = useArray({ initial: [1, 2, 3] });
		const cloned = clone();
		expect(cloned).toEqual([1, 2, 3]);
		expect(cloned).not.toBe(array.value);
	});

	it("should compute first and last items", () => {
		const { first, last } = useArray({ initial: [1, 2, 3] });
		expect(first.value).toBe(1);
		expect(last.value).toBe(3);
	});

	it("should handle empty array for first and last", () => {
		const { first, last } = useArray();
		expect(first.value).toBeUndefined();
		expect(last.value).toBeUndefined();
	});
});
