import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery";

describe("useMediaQuery", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with false when matchMedia is not available", () => {
		vi.stubGlobal("window", {});

		const { matches } = useMediaQuery("(min-width: 768px)");
		expect(matches.value).toBe(false);

		vi.unstubAllGlobals();
	});

	it("should initialize with matchMedia result", () => {
		const mockMediaQuery = {
			matches: true,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
		};

		vi.stubGlobal("window", {
			matchMedia: vi.fn().mockReturnValue(mockMediaQuery),
		});

		const { matches } = useMediaQuery("(min-width: 768px)");

		expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 768px)");
		expect(matches.value).toBe(true);

		vi.unstubAllGlobals();
	});

	it("should handle media query changes", () => {
		const mockMediaQuery = {
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
		};

		vi.stubGlobal("window", {
			matchMedia: vi.fn().mockReturnValue(mockMediaQuery),
		});

		const { matches } = useMediaQuery("(min-width: 768px)");

		expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function),
		);

		// Simulate media query change
		const changeCallback = mockMediaQuery.addEventListener.mock.calls[0]?.[1];
		if (changeCallback) {
			changeCallback({ matches: true });
		}

		expect(matches.value).toBe(true);

		vi.unstubAllGlobals();
	});

	it("should fallback to addListener for older browsers", () => {
		const mockMediaQuery = {
			matches: true,
			addEventListener: undefined,
			removeEventListener: undefined,
			addListener: vi.fn(),
			removeListener: vi.fn(),
		};

		vi.stubGlobal("window", {
			matchMedia: vi.fn().mockReturnValue(mockMediaQuery),
		});

		const { matches } = useMediaQuery("(min-width: 768px)");

		expect(mockMediaQuery.addListener).toHaveBeenCalledWith(
			expect.any(Function),
		);
		expect(matches.value).toBe(true);

		vi.unstubAllGlobals();
	});

	it("should cleanup event listeners on unmount", () => {
		const mockMediaQuery = {
			matches: true,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
		};

		vi.stubGlobal("window", {
			matchMedia: vi.fn().mockReturnValue(mockMediaQuery),
		});

		useMediaQuery("(min-width: 768px)");

		// Simulate unmount
		const mockOnUnmounted = vi.fn();
		vi.stubGlobal("onUnmounted", mockOnUnmounted);

		useMediaQuery("(min-width: 768px)");

		// Call the cleanup function if it was registered
		if (mockOnUnmounted.mock.calls[0]?.[0]) {
			mockOnUnmounted.mock.calls[0][0]();
		}

		expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function),
		);

		vi.unstubAllGlobals();
	});
});
