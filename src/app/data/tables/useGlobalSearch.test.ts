import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useGlobalSearch } from "./useGlobalSearch";

describe("useGlobalSearch", () => {
	const data = ref([
		{ id: 1, name: "Alice", email: "alice@example.com" },
		{ id: 2, name: "Bob", email: "bob@example.com" },
		{ id: 3, name: "Charlie", email: "charlie@work.com" },
	]);

	it("should return all data when search term is empty", () => {
		const { searchResults } = useGlobalSearch(data, ["name", "email"]);
		expect(searchResults.value).toEqual(data.value);
	});

	it("should filter by a single key", () => {
		const { searchResults, searchTerm } = useGlobalSearch(data, ["name"]);
		searchTerm.value = "ali";
		expect(searchResults.value).toEqual([
			{ id: 1, name: "Alice", email: "alice@example.com" },
		]);
	});

	it("should filter by multiple keys", () => {
		const { searchResults, searchTerm } = useGlobalSearch(data, [
			"name",
			"email",
		]);
		searchTerm.value = "com";
		expect(searchResults.value.length).toBe(3);
		searchTerm.value = "work.com";
		expect(searchResults.value).toEqual([
			{ id: 3, name: "Charlie", email: "charlie@work.com" },
		]);
	});

	it("should be case-insensitive", () => {
		const { searchResults, searchTerm } = useGlobalSearch(data, ["name"]);
		searchTerm.value = "BOB";
		expect(searchResults.value).toEqual([
			{ id: 2, name: "Bob", email: "bob@example.com" },
		]);
	});

	it("should return an empty array if no matches are found", () => {
		const { searchResults, searchTerm } = useGlobalSearch(data, [
			"name",
			"email",
		]);
		searchTerm.value = "xyz";
		expect(searchResults.value).toEqual([]);
	});

	it("should handle numeric values", () => {
		const numericData = ref([
			{ id: 1, value: 123 },
			{ id: 2, value: 456 },
		]);
		const { searchResults, searchTerm } = useGlobalSearch(numericData, [
			"value",
		]);
		searchTerm.value = "23";
		expect(searchResults.value).toEqual([{ id: 1, value: 123 }]);
	});
});
