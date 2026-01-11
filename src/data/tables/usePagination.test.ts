import { describe, expect, it } from "vitest";
import { paginateArray, usePagination } from "./usePagination";

describe("usePagination", () => {
	it("should initialize with default values", () => {
		const { currentPage, pageSize, totalItems, totalPages } = usePagination();

		expect(currentPage.value).toBe(1);
		expect(pageSize.value).toBe(10);
		expect(totalItems.value).toBe(0);
		expect(totalPages.value).toBe(1);
	});

	it("should initialize with custom values", () => {
		const { currentPage, pageSize, totalItems, totalPages } = usePagination({
			currentPage: 2,
			pageSize: 5,
			totalItems: 25,
		});

		expect(currentPage.value).toBe(2);
		expect(pageSize.value).toBe(5);
		expect(totalItems.value).toBe(25);
		expect(totalPages.value).toBe(5);
	});

	it("should calculate total pages correctly", () => {
		const { totalPages, setTotalItems } = usePagination({ pageSize: 10 });

		setTotalItems(95);
		expect(totalPages.value).toBe(10);

		setTotalItems(100);
		expect(totalPages.value).toBe(10);

		setTotalItems(101);
		expect(totalPages.value).toBe(11);
	});

	it("should check if has next/previous page", () => {
		const { hasNextPage, hasPreviousPage, goToPage } = usePagination({
			currentPage: 1,
			pageSize: 10,
			totalItems: 30,
		});

		expect(hasNextPage.value).toBe(true);
		expect(hasPreviousPage.value).toBe(false);

		goToPage(3);
		expect(hasNextPage.value).toBe(false);
		expect(hasPreviousPage.value).toBe(true);
	});

	it("should calculate start and end indices", () => {
		const { startIndex, endIndex, goToPage, setPageSize } = usePagination({
			totalItems: 25,
		});

		expect(startIndex.value).toBe(0);
		expect(endIndex.value).toBe(10);

		goToPage(2);
		expect(startIndex.value).toBe(10);
		expect(endIndex.value).toBe(20);

		goToPage(3);
		expect(startIndex.value).toBe(20);
		expect(endIndex.value).toBe(25);

		setPageSize(5);
		expect(startIndex.value).toBe(0);
		expect(endIndex.value).toBe(5);
	});

	it("should generate page numbers", () => {
		const { pageNumbers, setTotalItems, setPageSize, goToPage } =
			usePagination();

		setTotalItems(100);
		setPageSize(10);

		// Current page 1
		expect(pageNumbers.value).toEqual([1, 2, 3, 4, 5]);

		// Current page 3
		goToPage(3);
		expect(pageNumbers.value).toEqual([1, 2, 3, 4, 5]);

		// Current page 5
		goToPage(5);
		expect(pageNumbers.value).toEqual([3, 4, 5, 6, 7]);

		// Current page 10
		goToPage(10);
		expect(pageNumbers.value).toEqual([6, 7, 8, 9, 10]);
	});

	it("should navigate to pages correctly", () => {
		const {
			currentPage,
			goToPage,
			nextPage,
			previousPage,
			firstPage,
			lastPage,
		} = usePagination({
			currentPage: 1,
			pageSize: 10,
			totalItems: 100,
		});

		goToPage(2);
		expect(currentPage.value).toBe(2);

		nextPage();
		expect(currentPage.value).toBe(3);

		previousPage();
		expect(currentPage.value).toBe(2);

		firstPage();
		expect(currentPage.value).toBe(1);

		lastPage();
		expect(currentPage.value).toBe(3);
	});

	it("should not navigate to invalid pages", () => {
		const { currentPage, goToPage, nextPage, previousPage } = usePagination({
			totalItems: 20,
		});

		goToPage(0);
		expect(currentPage.value).toBe(1); // Should stay at 1

		goToPage(5);
		expect(currentPage.value).toBe(2); // Should go to max page (2)

		currentPage.value = 1;
		previousPage();
		expect(currentPage.value).toBe(1); // Should stay at 1

		currentPage.value = 2;
		nextPage();
		expect(currentPage.value).toBe(2); // Should stay at max page
	});

	it("should set page size and reset to first page", () => {
		const { currentPage, pageSize, setPageSize } = usePagination({
			currentPage: 3,
			totalItems: 30,
		});

		setPageSize(5);
		expect(pageSize.value).toBe(5);
		expect(currentPage.value).toBe(1);
	});

	it("should set total items and adjust current page if needed", () => {
		const { currentPage, totalPages, setTotalItems } = usePagination({
			currentPage: 5,
			pageSize: 10,
		});

		setTotalItems(30); // Only 3 pages
		expect(totalPages.value).toBe(3);
		expect(currentPage.value).toBe(3); // Should adjust to max page
	});

	it("should reset to initial values", () => {
		const { currentPage, pageSize, totalItems, goToPage, setPageSize, reset } =
			usePagination({
				currentPage: 2,
				pageSize: 5,
				totalItems: 25,
			});

		goToPage(3);
		setPageSize(10);

		reset();
		expect(currentPage.value).toBe(2);
		expect(pageSize.value).toBe(5);
		expect(totalItems.value).toBe(25);
	});
});

describe("paginateArray", () => {
	const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

	it("should paginate array correctly", () => {
		const page1 = paginateArray(items, 1, 5);
		expect(page1).toEqual([1, 2, 3, 4, 5]);

		const page2 = paginateArray(items, 2, 5);
		expect(page2).toEqual([6, 7, 8, 9, 10]);

		const page3 = paginateArray(items, 3, 5);
		expect(page3).toEqual([11, 12]);
	});

	it("should handle empty array", () => {
		const result = paginateArray([], 1, 5);
		expect(result).toEqual([]);
	});

	it("should handle page beyond array bounds", () => {
		const result = paginateArray(items, 10, 5);
		expect(result).toEqual([]);
	});

	it("should handle page size larger than array", () => {
		const result = paginateArray(items, 1, 20);
		expect(result).toEqual(items);
	});
});
