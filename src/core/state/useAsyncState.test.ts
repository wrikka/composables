import { describe, expect, it } from "vitest";
import { useAsyncState } from "./useAsyncState";

const successPromise = () =>
	new Promise((resolve) => setTimeout(() => resolve("Success"), 10));
const errorPromise = () =>
	new Promise((_, reject) => setTimeout(() => reject(new Error("Error")), 10));

describe("useAsyncState", () => {
	it("should handle a successful promise", async () => {
		const { data, isLoading, isReady, error, execute } = useAsyncState(
			successPromise,
			{ immediate: false },
		);

		expect(isLoading.value).toBe(false);
		expect(isReady.value).toBe(false);
		expect(data.value).toBeUndefined();

		const promise = execute();

		expect(isLoading.value).toBe(true);

		await promise;

		expect(isLoading.value).toBe(false);
		expect(isReady.value).toBe(true);
		expect(data.value).toBe("Success");
		expect(error.value).toBeUndefined();
	});

	it("should handle a failing promise", async () => {
		const { data, isLoading, isReady, error, execute } = useAsyncState(
			errorPromise,
			{ immediate: false },
		);

		const promise = execute();

		expect(isLoading.value).toBe(true);

		await promise.catch(() => {});

		expect(isLoading.value).toBe(false);
		expect(isReady.value).toBe(false);
		expect(data.value).toBeUndefined();
		expect(error.value).toBeInstanceOf(Error);
		expect(error.value?.message).toBe("Error");
	});

	it("should execute immediately if immediate is true", async () => {
		const { isLoading, isReady } = useAsyncState(successPromise, {
			immediate: true,
		});

		expect(isLoading.value).toBe(true);
		expect(isReady.value).toBe(false);

		await new Promise((resolve) => setTimeout(resolve, 20)); // wait for promise to resolve

		expect(isLoading.value).toBe(false);
		expect(isReady.value).toBe(true);
	});

	it("should reset the state", async () => {
		const { data, isReady, reset } = useAsyncState(successPromise, {
			immediate: true,
		});

		await new Promise((resolve) => setTimeout(resolve, 20));

		expect(isReady.value).toBe(true);
		expect(data.value).toBe("Success");

		reset();

		expect(isReady.value).toBe(false);
		expect(data.value).toBeUndefined();
	});
});
