import { computed, ref } from "vue";

export interface UseUrlOptions {
	base?: string;
}

export function useUrl(options: UseUrlOptions = {}) {
	const { base = "" } = options;

	const url = ref(typeof window !== "undefined" ? window.location.href : "");

	const protocol = computed(() => {
		try {
			const urlObj = new URL(url.value);
			return urlObj.protocol;
		} catch {
			return "";
		}
	});

	const hostname = computed(() => {
		try {
			const urlObj = new URL(url.value);
			return urlObj.hostname;
		} catch {
			return "";
		}
	});

	const port = computed(() => {
		try {
			const urlObj = new URL(url.value);
			return urlObj.port;
		} catch {
			return "";
		}
	});

	const pathname = computed(() => {
		try {
			const urlObj = new URL(url.value);
			return urlObj.pathname;
		} catch {
			return "";
		}
	});

	const search = computed(() => {
		try {
			const urlObj = new URL(url.value);
			return urlObj.search;
		} catch {
			return "";
		}
	});

	const hash = computed(() => {
		try {
			const urlObj = new URL(url.value);
			return urlObj.hash;
		} catch {
			return "";
		}
	});

	const params = computed(() => {
		try {
			const urlObj = new URL(url.value);
			return Object.fromEntries(urlObj.searchParams.entries());
		} catch {
			return {};
		}
	});

	const setUrl = (newUrl: string) => {
		url.value = newUrl;
	};

	const setParam = (key: string, value: string) => {
		try {
			const urlObj = new URL(url.value);
			urlObj.searchParams.set(key, value);
			url.value = urlObj.toString();
		} catch {
			// Invalid URL, ignore
		}
	};

	const removeParam = (key: string) => {
		try {
			const urlObj = new URL(url.value);
			urlObj.searchParams.delete(key);
			url.value = urlObj.toString();
		} catch {
			// Invalid URL, ignore
		}
	};

	const getParam = (key: string): string | null => {
		try {
			const urlObj = new URL(url.value);
			return urlObj.searchParams.get(key);
		} catch {
			return null;
		}
	};

	const hasParam = (key: string): boolean => {
		return getParam(key) !== null;
	};

	const buildUrl = (path: string, params?: Record<string, string>) => {
		const baseUrl = base || url.value;
		try {
			const urlObj = new URL(path, baseUrl);
			if (params) {
				Object.entries(params).forEach(([key, value]) => {
					urlObj.searchParams.set(key, value);
				});
			}
			return urlObj.toString();
		} catch {
			return path;
		}
	};

	// Listen for URL changes in browser
	if (typeof window !== "undefined") {
		const handlePopState = () => {
			url.value = window.location.href;
		};

		window.addEventListener("popstate", handlePopState);
	}

	return {
		url,
		protocol,
		hostname,
		port,
		pathname,
		search,
		hash,
		params,
		setUrl,
		setParam,
		removeParam,
		getParam,
		hasParam,
		buildUrl,
	};
}
