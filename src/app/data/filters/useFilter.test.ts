import { describe, expect, it } from "vitest";
import { useFilter } from "./useFilter";

interface User {
	id: number;
	name: string;
	email: string;
	age: number;
	active: boolean;
	tags: string[];
}

describe("useFilter", () => {
	const users: User[] = [
		{
			id: 1,
			name: "Alice Johnson",
			email: "alice@example.com",
			age: 30,
			active: true,
			tags: ["admin", "user"],
		},
		{
			id: 2,
			name: "Bob Smith",
			email: "bob@example.com",
			age: 25,
			active: false,
			tags: ["user"],
		},
		{
			id: 3,
			name: "Charlie Brown",
			email: "charlie@example.com",
			age: 35,
			active: true,
			tags: ["guest"],
		},
		{
			id: 4,
			name: "Diana Prince",
			email: "diana@example.com",
			age: 28,
			active: true,
			tags: ["admin", "super"],
		},
	];

	it("should return all items when no filters are applied", () => {
		const { filteredItems } = useFilter(users);

		expect(filteredItems.value).toEqual(users);
	});

	it("should filter by equality", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("active", true, "equals");
		expect(filteredItems.value).toHaveLength(3);
		expect(filteredItems.value.every((u) => u.active)).toBe(true);
	});

	it("should filter by contains operator", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("name", "alice", "contains");
		expect(filteredItems.value).toHaveLength(1);
		expect(filteredItems.value[0]?.name).toBe("Alice Johnson");
	});

	it("should filter by startsWith operator", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("name", "A", "startsWith");
		expect(filteredItems.value).toHaveLength(1);
		expect(filteredItems.value[0]?.name).toBe("Alice Johnson");
	});

	it("should filter by endsWith operator", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("email", ".com", "endsWith");
		expect(filteredItems.value).toHaveLength(4); // All end with .com
	});

	it("should filter by greater than operator", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("age", 30, "gt");
		expect(filteredItems.value).toHaveLength(1);
		expect(filteredItems.value[0]?.age).toBe(35);
	});

	it("should filter by greater than or equal operator", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("age", 30, "gte");
		expect(filteredItems.value).toHaveLength(2);
		expect(filteredItems.value.map((u) => u.age)).toEqual([30, 35]);
	});

	it("should filter by less than operator", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("age", 30, "lt");
		expect(filteredItems.value).toHaveLength(2);
		expect(filteredItems.value.map((u) => u.age)).toEqual([25, 28]);
	});

	it("should filter by less than or equal operator", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("age", 28, "lte");
		expect(filteredItems.value).toHaveLength(2);
		expect(filteredItems.value.map((u) => u.age)).toEqual([25, 28]);
	});

	it("should filter by in operator", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("age", [25, 35], "in");
		expect(filteredItems.value).toHaveLength(2);
		expect(filteredItems.value.map((u) => u.age)).toEqual([25, 35]);
	});

	it("should filter by not in operator", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("age", [30], "nin");
		expect(filteredItems.value).toHaveLength(3);
		expect(filteredItems.value.every((u) => u.age !== 30)).toBe(true);
	});

	it("should use custom compare function", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("name", "alice", "contains", (value, searchTerm) =>
			String(value).toLowerCase().includes(String(searchTerm).toLowerCase()),
		);
		expect(filteredItems.value).toHaveLength(1);
		expect(filteredItems.value[0]?.name).toBe("Alice Johnson");
	});

	it("should apply multiple filters", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("active", true, "equals");
		filterBy("age", 25, "gt");

		expect(filteredItems.value).toHaveLength(2);
		expect(filteredItems.value.every((u) => u.active && u.age > 25)).toBe(true);
	});

	it("should update existing filter", () => {
		const { filteredItems, addFilter, updateFilter } = useFilter(users);

		addFilter({ key: "age", value: 25, operator: "gt" });
		expect(filteredItems.value).toHaveLength(3);

		updateFilter("age", { value: 30 });
		expect(filteredItems.value).toHaveLength(1);
	});

	it("should remove filter", () => {
		const { filteredItems, filterBy, removeFilter } = useFilter(users);

		filterBy("active", true, "equals");
		expect(filteredItems.value).toHaveLength(3);

		removeFilter("active");
		expect(filteredItems.value).toHaveLength(4);
	});

	it("should clear all filters", () => {
		const { filteredItems, filterBy, clearFilters } = useFilter(users);

		filterBy("active", true, "equals");
		filterBy("age", 25, "gt");
		expect(filteredItems.value).toHaveLength(2);

		clearFilters();
		expect(filteredItems.value).toHaveLength(4);
	});

	it("should check if filter exists", () => {
		const { hasFilter, filterBy } = useFilter(users);

		expect(hasFilter("active")).toBe(false);

		filterBy("active", true, "equals");
		expect(hasFilter("active")).toBe(true);
		expect(hasFilter("age")).toBe(false);
	});

	it("should get filter value", () => {
		const { getFilter, filterBy } = useFilter(users);

		filterBy("active", true, "equals");
		const filter = getFilter("active");

		expect(filter).toEqual({ key: "active", value: true, operator: "equals" });
		expect(getFilter("age")).toBeUndefined();
	});

	it("should filter by text across multiple fields", () => {
		const { filteredItems, filterByText } = useFilter(users);

		filterByText("alice", ["name", "email"]);
		expect(filteredItems.value).toHaveLength(1);
		expect(filteredItems.value[0]?.name).toBe("Alice Johnson");

		filterByText("example", ["email"]);
		expect(filteredItems.value).toHaveLength(4); // All have example.com
	});

	it("should filter by number range", () => {
		const { filteredItems, filterByRange } = useFilter(users);

		filterByRange("age", 25, 30);
		expect(filteredItems.value).toHaveLength(3);
		expect(filteredItems.value.map((u) => u.age)).toEqual([30, 25, 28]);
	});

	it("should handle empty array", () => {
		const { filteredItems, filterBy } = useFilter<User>([]);

		filterBy("name", "test", "contains");
		expect(filteredItems.value).toEqual([]);
	});

	it("should handle case insensitive text search", () => {
		const { filteredItems, filterBy } = useFilter(users);

		filterBy("name", "ALICE", "contains");
		expect(filteredItems.value).toHaveLength(1);
		expect(filteredItems.value[0]?.name).toBe("Alice Johnson");
	});
});

describe("Filter Helper Functions", () => {
	it("should create text filter", () => {
		const filter = (searchTerm: string) => (value: string) =>
			String(value).toLowerCase().includes(String(searchTerm).toLowerCase());

		const textFilter = filter("test");
		expect(textFilter("test")).toBe(true);
		expect(textFilter("Testing")).toBe(true);
		expect(textFilter("example")).toBe(false);
	});

	it("should create number range filter", () => {
		const filter = (min: number, max: number) => (value: number) =>
			value >= min && value <= max;

		const rangeFilter = filter(18, 30);
		expect(rangeFilter(25)).toBe(true);
		expect(rangeFilter(17)).toBe(false);
		expect(rangeFilter(31)).toBe(false);
	});
});
