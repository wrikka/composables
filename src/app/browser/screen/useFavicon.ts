import { onUnmounted, ref, watch } from "vue";

export interface UseFaviconOptions {
	baseUrl?: string;
	rel?: string;
	sizes?: string;
	type?: string;
}

export function useFavicon(href?: string, options: UseFaviconOptions = {}) {
	const { baseUrl = "", rel = "icon", sizes, type } = options;

	const favicon = ref(href);
	let link: HTMLLinkElement | null = null;

	const updateFavicon = (newHref: string) => {
		const fullUrl = baseUrl ? `${baseUrl}${newHref}` : newHref;

		if (!link) {
			link =
				document.querySelector('link[rel*="icon"]') ||
				document.createElement("link");
			link.rel = rel;
			if (sizes) link.sizes = sizes;
			if (type) link.type = type;
			document.head.appendChild(link);
		}

		link.href = fullUrl;
	};

	const setFavicon = (newHref: string) => {
		favicon.value = newHref;
	};

	const resetFavicon = () => {
		if (link) {
			document.head.removeChild(link);
			link = null;
		}
		favicon.value = "";
	};

	watch(
		favicon,
		(newHref) => {
			if (newHref) {
				updateFavicon(newHref);
			} else {
				resetFavicon();
			}
		},
		{ immediate: true },
	);

	onUnmounted(() => {
		resetFavicon();
	});

	return {
		favicon,
		setFavicon,
		resetFavicon,
	};
}
