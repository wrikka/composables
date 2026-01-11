import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePageVisibility } from "./usePageVisibility";

// Mock document and window events
const addEventListenerSpy = vi.spyOn(document, "addEventListener");
const windowAddEventListenerSpy = vi.spyOn(window, "addEventListener");

// Mock document properties
Object.defineProperty(document, "hidden", {
	value: false,
	writable: true,
});

Object.defineProperty(document, "hasFocus", {
	value: vi.fn().mockReturnValue(true),
	writable: true,
});

describe("usePageVisibility", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("document", {
			hidden: false,
			hasFocus: vi.fn().mockReturnValue(true),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		});
	});

	it("should initialize visibility state", () => {
		const { isVisible, isFocused } = usePageVisibility();

		expect(isVisible.value).toBe(true);
		expect(isFocused.value).toBe(true);
	});

	it("should handle visibility change", () => {
		const onVisible = vi.fn();
		const onHidden = vi.fn();
		const { isVisible } = usePageVisibility({ onVisible, onHidden });

		vi.stubGlobal("document", {
			...document,
			hidden: true,
		});
		document.dispatchEvent(new Event("visibilitychange"));

		expect(isVisible.value).toBe(false);
		expect(onHidden).toHaveBeenCalled();
		expect(onVisible).not.toHaveBeenCalled();

		vi.stubGlobal("document", {
			...document,
			hidden: false,
		});
		document.dispatchEvent(new Event("visibilitychange"));

		expect(isVisible.value).toBe(true);
		expect(onVisible).toHaveBeenCalled();
	});

	it("should handle focus events", () => {
		const onFocus = vi.fn();
		const onBlur = vi.fn();
		const { isFocused } = usePageVisibility({ onFocus, onBlur });

		window.dispatchEvent(new Event("blur"));

		expect(isFocused.value).toBe(false);
		expect(onBlur).toHaveBeenCalled();

		window.dispatchEvent(new Event("focus"));

		expect(isFocused.value).toBe(true);
		expect(onFocus).toHaveBeenCalled();
	});

	it("should set up event listeners", () => {
		usePageVisibility();

		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"visibilitychange",
			expect.any(Function),
		);
		expect(windowAddEventListenerSpy).toHaveBeenCalledWith(
			"focus",
			expect.any(Function),
		);
		expect(windowAddEventListenerSpy).toHaveBeenCalledWith(
			"blur",
			expect.any(Function),
		);
	});

	it("should handle initial hidden state", () => {
		vi.stubGlobal("document", {
			...document,
			hidden: true,
		});
		const { isVisible } = usePageVisibility();

		expect(isVisible.value).toBe(false);
	});

	it("should handle initial unfocused state", () => {
		vi.stubGlobal("document", {
			...document,
			hasFocus: vi.fn().mockReturnValue(false),
		});
		const { isFocused } = usePageVisibility();

		expect(isFocused.value).toBe(false);
	});
});
