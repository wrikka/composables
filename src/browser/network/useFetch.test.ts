import { nextTick, ref } from "vue";
import { useFetch } from "./useFetch";

// Mock fetch
global.fetch = vi.fn();

describe("useFetch", () => {
	beforeEach(() => {
		(fetch as any).mockClear();
	});

	it("should fetch data immediately", async () => {
		const mockData = { name: "test" };
		(fetch as any).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockData),
		});

		const { data, isFetching, error } = useFetch("test-url");
		expect(isFetching.value).toBe(true);

		await nextTick(); // allow promises to resolve
		await nextTick();

		expect(fetch).toHaveBeenCalledWith("test-url", expect.any(Object));
		expect(data.value).toEqual(mockData);
		expect(isFetching.value).toBe(false);
		expect(error.value).toBeNull();
	});

	it("should not fetch immediately if immediate is false", () => {
		useFetch("test-url", { immediate: false });
		expect(fetch).not.toHaveBeenCalled();
	});

	it("should handle fetch errors", async () => {
		(fetch as any).mockRejectedValueOnce(new Error("Fetch error"));

		const { data, isFetching, error } = useFetch("error-url");
		await nextTick();
		await nextTick();

		expect(data.value).toBeNull();
		expect(isFetching.value).toBe(false);
		expect(error.value).toEqual(new Error("Fetch error"));
	});

	it("should react to url changes", async () => {
		(fetch as any)
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: 1 }),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: 2 }),
			});

		const url = ref("url1");
		const { data } = useFetch(url);

		await nextTick();
		await nextTick();
		expect(data.value).toEqual({ data: 1 });

		url.value = "url2";
		await nextTick();
		await nextTick();
		expect(fetch).toHaveBeenCalledWith("url2", expect.any(Object));
		expect(data.value).toEqual({ data: 2 });
	});

	it("should abort the fetch request", async () => {
		const { abort, aborted, isFetching } = useFetch("abort-url");
		expect(isFetching.value).toBe(true);

		abort();

		await nextTick();
		await nextTick();

		expect(aborted.value).toBe(true);
		expect(isFetching.value).toBe(false);
	});
});
