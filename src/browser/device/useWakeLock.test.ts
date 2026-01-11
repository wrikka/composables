import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWakeLock } from "./useWakeLock";

// Mock Wake Lock API
const mockWakeLockSentinel = {
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	release: vi.fn().mockResolvedValue(undefined),
};

const mockRequest = vi.fn().mockResolvedValue(mockWakeLockSentinel);

Object.defineProperty(navigator, "wakeLock", {
	value: {
		request: mockRequest,
	},
	writable: true,
});

// Mock document.visibilityState
Object.defineProperty(document, "visibilityState", {
	value: "visible",
	writable: true,
});

describe("useWakeLock", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockWakeLockSentinel.release.mockClear();
		mockWakeLockSentinel.addEventListener.mockClear();
	});

	it("should detect wake lock API support", () => {
		const { isSupported } = useWakeLock();
		expect(isSupported.value).toBe(true);
	});

	it("should request wake lock successfully", async () => {
		const { requestWakeLock, isActive, isPending, error } = useWakeLock();

		const result = await requestWakeLock();

		expect(result).toBe(true);
		expect(isActive.value).toBe(true);
		expect(isPending.value).toBe(false);
		expect(error.value).toBe(null);
		expect(mockRequest).toHaveBeenCalledWith("screen");
	});

	it("should handle wake lock request error", async () => {
		const testError = new Error("Wake lock denied");
		mockRequest.mockRejectedValueOnce(testError);

		const onError = vi.fn();
		const { requestWakeLock, isActive, error } = useWakeLock({
			onRequestError: onError,
		});

		const result = await requestWakeLock();

		expect(result).toBe(false);
		expect(isActive.value).toBe(false);
		expect(error.value).toBe(testError);
		expect(onError).toHaveBeenCalledWith(testError);
	});

	it("should release wake lock", () => {
		const { releaseWakeLock } = useWakeLock();

		// Manually set sentinel for testing
		const { requestWakeLock } = useWakeLock();
		requestWakeLock();

		const result = releaseWakeLock();

		expect(result).toBe(true);
		expect(mockWakeLockSentinel.release).toHaveBeenCalled();
	});

	it("should toggle wake lock state", async () => {
		const { toggleWakeLock, isActive } = useWakeLock();

		// Turn on
		const result1 = await toggleWakeLock();
		expect(result1).toBe(true);
		expect(isActive.value).toBe(true);

		// Turn off
		const result2 = await toggleWakeLock();
		expect(result2).toBe(true);
		expect(isActive.value).toBe(false);
	});

	it("should handle unsupported API", () => {
		const originalWakeLock = navigator.wakeLock;
		delete (navigator as any).wakeLock;

		const { isSupported, requestWakeLock } = useWakeLock();

		expect(isSupported.value).toBe(false);

		requestWakeLock().then((result) => {
			expect(result).toBe(false);
		});

		// Restore
		Object.defineProperty(navigator, "wakeLock", {
			value: originalWakeLock,
			writable: true,
		});
	});
});
