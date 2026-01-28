import { describe, expect, it, vi, beforeEach } from "vitest";
import { useAxios } from "./useAxios";

const mockFetch = vi.fn();

global.fetch = mockFetch as any;

describe("useAxios", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with default values", () => {
		const { data, error, isLoading, isReady, isFinished } = useAxios();

		expect(data.value).toBeNull();
		expect(error.value).toBeNull();
		expect(isLoading.value).toBe(false);
		expect(isReady.value).toBe(true);
		expect(isFinished.value).toBe(true);
	});

	it("should execute GET request successfully", async () => {
		const mockResponse = { data: "test" };
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		});

		const { get, data } = useAxios();

		await get("https://api.example.com/test");

		expect(data.value).toEqual(mockResponse);
		expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
			method: "GET",
			headers: undefined,
			body: undefined,
		});
	});

	it("should execute POST request successfully", async () => {
		const mockResponse = { success: true };
		const mockBody = { name: "test" };
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		});

		const { post, data } = useAxios();

		await post("https://api.example.com/create", mockBody);

		expect(data.value).toEqual(mockResponse);
		expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/create", {
			method: "POST",
			headers: undefined,
			body: JSON.stringify(mockBody),
		});
	});

	it("should execute PUT request successfully", async () => {
		const mockResponse = { updated: true };
		const mockBody = { id: 1, name: "updated" };
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		});

		const { put, data } = useAxios();

		await put("https://api.example.com/update/1", mockBody);

		expect(data.value).toEqual(mockResponse);
		expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/update/1", {
			method: "PUT",
			headers: undefined,
			body: JSON.stringify(mockBody),
		});
	});

	it("should execute DELETE request successfully", async () => {
		const mockResponse = { deleted: true };
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		});

		const { del, data } = useAxios();

		await del("https://api.example.com/delete/1");

		expect(data.value).toEqual(mockResponse);
		expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/delete/1", {
			method: "DELETE",
			headers: undefined,
			body: undefined,
		});
	});

	it("should execute PATCH request successfully", async () => {
		const mockResponse = { patched: true };
		const mockBody = { name: "patched" };
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		});

		const { patch, data } = useAxios();

		await patch("https://api.example.com/patch/1", mockBody);

		expect(data.value).toEqual(mockResponse);
		expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/patch/1", {
			method: "PATCH",
			headers: undefined,
			body: JSON.stringify(mockBody),
		});
	});

	it("should handle request error", async () => {
		const mockError = new Error("Network error");
		mockFetch.mockRejectedValue(mockError);

		const { get, error } = useAxios();

		await expect(get("https://api.example.com/test")).rejects.toThrow();

		expect(error.value).toBe(mockError);
	});

	it("should handle non-ok response", async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			json: () => Promise.resolve({ message: "Not found" }),
		});

		const { get, error } = useAxios();

		await expect(get("https://api.example.com/test")).rejects.toThrow();

		expect(error.value).toBeDefined();
	});

	it("should call onSuccess callback", async () => {
		const mockResponse = { data: "test" };
		const onSuccess = vi.fn();
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		});

		const { get } = useAxios({ onSuccess });

		await get("https://api.example.com/test");

		expect(onSuccess).toHaveBeenCalledWith(mockResponse);
	});

	it("should call onError callback", async () => {
		const mockError = new Error("Network error");
		const onError = vi.fn();
		mockFetch.mockRejectedValue(mockError);

		const { get } = useAxios({ onError });

		await get("https://api.example.com/test").catch(() => {});

		expect(onError).toHaveBeenCalledWith(mockError);
	});

	it("should set loading state during request", async () => {
		mockFetch.mockImplementation(() => new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					ok: true,
					json: () => Promise.resolve({ data: "test" }),
				});
			}, 10);
		}));

		const { get, isLoading } = useAxios();

		const promise = get("https://api.example.com/test");

		expect(isLoading.value).toBe(true);

		await promise;

		expect(isLoading.value).toBe(false);
	});

	it("should accept custom headers", async () => {
		const mockResponse = { data: "test" };
		const mockHeaders = { "Content-Type": "application/json" };
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		});

		const { get } = useAxios();

		await get("https://api.example.com/test", { headers: mockHeaders });

		expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
			method: "GET",
			headers: mockHeaders,
			body: undefined,
		});
	});
});
