import { describe, expect, it, vi } from "vitest";
import { useFingerprint } from "./useFingerprint";

describe("useFingerprint", () => {
	it("should initialize with default values", () => {
		const { fingerprint, isLoading, error } = useFingerprint();

		expect(fingerprint.value).toBeNull();
		expect(isLoading.value).toBe(true);
		expect(error.value).toBeNull();
	});

	it("should generate fingerprint", async () => {
		const { fingerprint } = useFingerprint();

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(fingerprint.value).not.toBeNull();
		expect(fingerprint.value?.userAgent).toBeDefined();
		expect(fingerprint.value?.language).toBeDefined();
		expect(fingerprint.value?.platform).toBeDefined();
	});

	it("should generate hash", async () => {
		const { fingerprint } = useFingerprint();

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(fingerprint.value?.hash).toBeDefined();
		expect(typeof fingerprint.value?.hash).toBe("string");
		expect(fingerprint.value?.hash.length).toBeGreaterThan(0);
	});

	it("should include canvas fingerprint", async () => {
		const { fingerprint } = useFingerprint();

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(fingerprint.value?.canvas).toBeDefined();
		expect(typeof fingerprint.value?.canvas).toBe("string");
	});

	it("should include WebGL fingerprint", async () => {
		const { fingerprint } = useFingerprint();

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(fingerprint.value?.webGL).toBeDefined();
		expect(typeof fingerprint.value?.webGL).toBe("string");
	});

	it("should include storage support info", async () => {
		const { fingerprint } = useFingerprint();

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(typeof fingerprint.value?.sessionStorage).toBe("boolean");
		expect(typeof fingerprint.value?.localStorage).toBe("boolean");
		expect(typeof fingerprint.value?.indexedDB).toBe("boolean");
	});

	it("should include screen info", async () => {
		const { fingerprint } = useFingerprint();

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(fingerprint.value?.screenResolution).toBeDefined();
		expect(fingerprint.value?.colorDepth).toBeDefined();
	});

	it("should include timezone info", async () => {
		const { fingerprint } = useFingerprint();

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(fingerprint.value?.timezone).toBeDefined();
		expect(typeof fingerprint.value?.timezone).toBe("string");
	});

	it("should provide generate function", () => {
		const { generate } = useFingerprint();

		expect(generate).toBeDefined();
		expect(typeof generate).toBe("function");
	});

	it("should set loading state correctly", async () => {
		const { isLoading } = useFingerprint();

		expect(isLoading.value).toBe(true);

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(isLoading.value).toBe(false);
	});
});
