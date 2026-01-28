import { onMounted, onUnmounted, ref } from "vue";

export interface LanguageOptions {
	fallback?: string;
	onChange?: (language: string) => void;
}

export function useLanguage(options: LanguageOptions = {}) {
	const { fallback = "en", onChange } = options;

	const language = ref<string>(navigator.language || fallback);
	const languages = ref<string[]>([...navigator.languages]);

	const handleLanguageChange = () => {
		const newLanguage = navigator.language || fallback;
		const newLanguages = navigator.languages || [newLanguage];

		if (newLanguage !== language.value) {
			language.value = newLanguage;
			languages.value = [...newLanguages];
			onChange?.(newLanguage);
		}
	};

	const getLanguageCode = (locale?: string): string => {
		const effectiveLocale = locale || language.value || "";
		return (effectiveLocale || "").split("-")[0]!;
	};

	const getRegionCode = (locale?: string): string | null => {
		const effectiveLocale = locale || language.value || "";
		const parts = (effectiveLocale || "").split("-");
		return parts.length > 1 ? parts[1]! : null;
	};

	const isRTL = (locale: string = language.value): boolean => {
		const rtlLanguages = ["ar", "he", "fa", "ur", "yi", "ku", "ps"];
		const langCode = getLanguageCode(locale);
		return rtlLanguages.includes(langCode);
	};

	const getFormattedLanguage = (locale: string = language.value): string => {
		try {
			return (
				new Intl.DisplayNames(locale, { type: "language" }).of(locale) || locale
			);
		} catch {
			return locale;
		}
	};

	const getLanguageDirection = (
		locale: string = language.value,
	): "ltr" | "rtl" => {
		return isRTL(locale) ? "rtl" : "ltr";
	};

	const formatDate = (
		date: Date,
		locale: string = language.value,
		options?: Intl.DateTimeFormatOptions,
	) => {
		return new Intl.DateTimeFormat(locale, options).format(date);
	};

	const formatNumber = (
		num: number,
		locale: string = language.value,
		options?: Intl.NumberFormatOptions,
	) => {
		return new Intl.NumberFormat(locale, options).format(num);
	};

	const formatCurrency = (
		amount: number,
		currency: string,
		locale: string = language.value,
	) => {
		return new Intl.NumberFormat(locale, {
			style: "currency",
			currency,
		}).format(amount);
	};

	const formatRelativeTime = (
		value: number,
		unit: Intl.RelativeTimeFormatUnit,
		locale: string = language.value,
	) => {
		const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
		return rtf.format(value, unit);
	};

	// Listen for language changes (though this is rarely supported)
	onMounted(() => {
		// Some browsers may fire this event, though it's not standard
		window.addEventListener("languagechange", handleLanguageChange);
	});

	onUnmounted(() => {
		window.removeEventListener("languagechange", handleLanguageChange);
	});

	return {
		language,
		languages,
		getLanguageCode,
		getRegionCode,
		isRTL,
		getFormattedLanguage,
		getLanguageDirection,
		formatDate,
		formatNumber,
		formatCurrency,
		formatRelativeTime,
	};
}
