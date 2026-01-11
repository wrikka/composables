import { describe, expect, it } from "vitest";
import { useTable } from "./useTable";

interface TestData {
	id: number;
	name: string;
	age: number;
	city: string;
}

describe("useTable", () => {
	const testData: TestData[] = [
		{ id: 1, name: "John", age: 25, city: "New York" },
		{ id: 2, name: "Jane", age: 30, city: "London" },
		{ id: 3, name: "Bob", age: 35, city: "Paris" },
		{ id: 4, name: "Alice", age: 28, city: "Tokyo" },
		{ id: 5, name: "Charlie", age: 32, city: "Berlin" },
	];

	const columns = [
		{ key: "id" as keyof TestData, label: "ID", sortable: true },
		{
			key: "name" as keyof TestData,
			label: "Name",
			sortable: true,
			filterable: true,
		},
		{ key: "age" as keyof TestData, label: "Age", sortable: true },
		{ key: "city" as keyof TestData, label: "City", filterable: true },
	];

	it("should initialize table with data", () => {
		const table = useTable({ data: testData, columns });

		expect(table.data.value).toEqual(testData);
		expect(table.totalItems.value).toBe(5);
		expect(table.currentPage.value).toBe(1);
		expect(table.pageSize.value).toBe(10);
	});

	it("should sort data by column", () => {
		const table = useTable({ data: testData, columns });

		// Sort by name ascending
		table.setSort("name");
		expect(table.sortBy.value).toBe("name");
		expect(table.sortOrder.value).toBe("asc");
		expect(table.sortedData.value[0]?.name).toBe("Alice");

		// Sort by name descending
		table.setSort("name");
		expect(table.sortOrder.value).toBe("desc");
		expect(table.sortedData.value[0]?.name).toBe("John");
	});

	it("should filter data", () => {
		const table = useTable({ data: testData, columns });

		table.setFilter("name", "John");
		expect(table.filteredData.value).toHaveLength(1);
		expect(table.filteredData.value[0]?.name).toBe("John");

		table.clearFilter("name");
		expect(table.filteredData.value).toHaveLength(5);
	});

	it("should search data", () => {
		const table = useTable({ data: testData, columns });

		table.setSearch("john");
		expect(table.filteredData.value).toHaveLength(1);
		expect(table.filteredData.value[0]?.name).toBe("John");

		table.setSearch("");
		expect(table.filteredData.value).toHaveLength(5);
	});

	it("should paginate data", () => {
		const table = useTable({
			data: testData,
			columns,
			initialPageSize: 2,
		});

		expect(table.data.value).toHaveLength(2);
		expect(table.totalPages.value).toBe(3);

		table.nextPage();
		expect(table.currentPage.value).toBe(2);
		expect(table.data.value).toHaveLength(2);

		table.lastPage();
		expect(table.currentPage.value).toBe(3);
		expect(table.data.value).toHaveLength(1);
	});

	it("should combine search, filter, and sort", () => {
		const table = useTable({ data: testData, columns });

		// Search for 'a' (should match Jane, Alice, Charlie)
		table.setSearch("a");
		expect(table.filteredData.value).toHaveLength(3);

		// Filter by age > 28
		table.setFilter("age", 30);
		expect(table.filteredData.value).toHaveLength(1);
		expect(table.filteredData.value[0]?.name).toBe("Jane");

		// Sort by name
		table.setSort("name");
		expect(table.sortedData.value[0]?.name).toBe("Jane");
	});

	it("should get unique values for filtering", () => {
		const table = useTable({ data: testData, columns });

		const uniqueCities = table.getUniqueValues("city");
		expect(uniqueCities).toEqual([
			"New York",
			"London",
			"Paris",
			"Tokyo",
			"Berlin",
		]);
	});

	it("should check if column is sorted", () => {
		const table = useTable({ data: testData, columns });

		expect(table.isSortedBy("name")).toBe(false);

		table.setSort("name");
		expect(table.isSortedBy("name")).toBe(true);
		expect(table.isSortedBy("age")).toBe(false);
	});

	it("should get sort direction", () => {
		const table = useTable({ data: testData, columns });

		table.setSort("name");
		expect(table.getSortDirection("name")).toBe("asc");

		table.setSort("name");
		expect(table.getSortDirection("name")).toBe("desc");

		expect(table.getSortDirection("age")).toBe(null);
	});

	it("should get cell value with custom render", () => {
		const customColumns = [
			...columns,
			{
				key: "name" as keyof TestData,
				label: "Custom Name",
				render: (value: string) => value.toUpperCase(),
			},
		];

		const table = useTable({ data: testData, columns: customColumns });
		const customColumn = customColumns[4];
		const row = testData[0];

		const value = table.getCellValue(row!, customColumn!);
		expect(value).toBe("JOHN");
	});

	it("should reset page when changing filters", () => {
		const table = useTable({ data: testData, columns, initialPageSize: 2 });

		table.nextPage();
		expect(table.currentPage.value).toBe(2);

		table.setFilter("name", "John");
		expect(table.currentPage.value).toBe(1);
	});

	it("should handle empty data", () => {
		const table = useTable({ data: [], columns });

		expect(table.data.value).toEqual([]);
		expect(table.totalItems.value).toBe(0);
		expect(table.totalPages.value).toBe(0);
	});

	it("should clear all filters", () => {
		const table = useTable({ data: testData, columns });

		table.setFilter("name", "John");
		table.setSearch("test");

		table.clearAllFilters();

		expect(table.filters.value).toEqual({});
		expect(table.searchQuery.value).toBe("");
		expect(table.filteredData.value).toHaveLength(5);
	});

	it("should handle invalid page numbers", () => {
		const table = useTable({ data: testData, columns });

		table.setPage(0);
		expect(table.currentPage.value).toBe(1);

		table.setPage(100);
		expect(table.currentPage.value).toBe(1);
	});

	it("should work with custom search fields", () => {
		const table = useTable({
			data: testData,
			columns,
			searchFields: ["name", "city"],
		});

		table.setSearch("New York");
		expect(table.filteredData.value).toHaveLength(1);
		expect(table.filteredData.value[0]?.city).toBe("New York");
	});
});
