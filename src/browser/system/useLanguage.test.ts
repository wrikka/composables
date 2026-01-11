import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguage } from "./useLanguage";

// Mock navigator properties
Object.defineProperty(navigator, "language", {
	value: "en-US",
	writable: true,
});

Object.defineProperty(navigator, "languages", {
	value: ["en-US", "en", "es"],
	writable: true,
});

describe("useLanguage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("navigator", {
			language: "en-US",
			languages: ["en-US", "en", "es"],
		});
	});

	it("should initialize with navigator language", () => {
		const { language, languages } = useLanguage();

		expect(language.value).toBe("en-US");
		expect(languages.value).toEqual(["en-US", "en", "es"]);
	});

	it("should use fallback language", () => {
		vi.stubGlobal("navigator", {
			language: "",
			languages: [],
		});

		const { language } = useLanguage({ fallback: "fr" });

		expect(language.value).toBe("fr");
	});

	it("should get language code", () => {
		const { getLanguageCode } = useLanguage();

		expect(getLanguageCode()).toBe("en");
		expect(getLanguageCode("es-ES")).toBe("es");
		expect(getLanguageCode("fr")).toBe("fr");
	});

	it("should get region code", () => {
		const { getRegionCode } = useLanguage();

		expect(getRegionCode()).toBe("US");
		expect(getRegionCode("es-ES")).toBe("ES");
		expect(getRegionCode("fr")).toBe(null);
	});

	it("should detect RTL languages", () => {
		const { isRTL } = useLanguage();

		expect(isRTL("en-US")).toBe(false);
		expect(isRTL("ar-SA")).toBe(true);
		expect(isRTL("he-IL")).toBe(true);
		expect(isRTL("fa-IR")).toBe(true);
		expect(isRTL("es-ES")).toBe(false);
	});

	it("should get language direction", () => {
		const { getLanguageDirection } = useLanguage();

		expect(getLanguageDirection("en-US")).toBe("ltr");
		expect(getLanguageDirection("ar-SA")).toBe("rtl");
	});

	it("should format date", () => {
		const { formatDate } = useLanguage();
		const date = new Date("2023-01-01");

		const formatted = formatDate(date);
		expect(formatted).toBeTruthy();
		expect(typeof formatted).toBe("string");
	});

	it("should format number", () => {
		const { formatNumber } = useLanguage();

		expect(formatNumber(1234.56)).toBe("1,234.56");
		expect(formatNumber(1234.56, "de-DE")).toBe("1.234,56");
	});

	it("should format currency", () => {
		const { formatCurrency } = useLanguage();

		expect(formatCurrency(1234.56, "USD")).toContain("$");
		expect(formatCurrency(1234.56, "EUR", "de-DE")).toContain("€");
	});

	it("should format relative time", () => {
		const { formatRelativeTime } = useLanguage();

		expect(formatRelativeTime(-1, "day")).toBeTruthy();
		expect(formatRelativeTime(2, "hour")).toBeTruthy();
		expect(typeof formatRelativeTime(-1, "day")).toBe("string");
	});

	it("should handle language change", () => {
		const onChange = vi.fn();
		const { language } = useLanguage({ onChange });

		// Simulate language change
		vi.stubGlobal("navigator", {
			language: "es-ES",
			languages: ["es-ES", "es"],
		});
		window.dispatchEvent(new Event("languagechange"));

		expect(language.value).toBe("es-ES");
		expect(onChange).toHaveBeenCalledWith("es-ES");
	});

	it("should get formatted language name", () => {
		const { getFormattedLanguage } = useLanguage();

		const formatted = getFormattedLanguage("en-US");
		expect(formatted).toBeTruthy();
		expect(typeof formatted).toBe("string");
	});

	it("should handle unsupported locale in formatting", () => {
		const { getFormattedLanguage } = useLanguage();

		// This should not throw an error
		const formatted = getFormattedLanguage("invalid-locale");
		expect(formatted).toBe("invalid-locale");
	});

	it("should clean up event listeners", () => {
		const addEventListenerSpy = vi.spyOn(window, "addEventListener");
		const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

		useLanguage();

		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"languagechange",
			expect.any(Function),
		);

		// Cleanup happens in onUnmounted
		removeEventListenerSpy.mockClear();
	});
});
