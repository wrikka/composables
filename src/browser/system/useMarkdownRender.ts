import { fromHighlighter } from "@shikijs/markdown-it/core";
import MarkdownIt from "markdown-it";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { computed, ref, watch } from "vue";

export interface MarkdownRenderOptions {
	html?: boolean;
	linkify?: boolean;
	typographer?: boolean;
	breaks?: boolean;
	quotes?: string | string[];
	highlight?: boolean;
	theme?: string;
	languages?: string[];
}

export interface MarkdownRender {
	html: string;
	render: (markdown: string) => string;
	setOptions: (options: Partial<MarkdownRenderOptions>) => void;
	isSupported: boolean;
	isLoading: boolean;
	error: Error | null;
}

export function useMarkdownRender(options: MarkdownRenderOptions = {}) {
	const markdown = ref("");
	const html = ref("");
	const isLoading = ref(false);
	const error = ref<Error | null>(null);
	const md = ref<MarkdownIt | null>(null);

	const defaultOptions: MarkdownRenderOptions = {
		html: true,
		linkify: true,
		typographer: true,
		breaks: false,
		quotes: "\"\"''",
		highlight: true,
		theme: "vitesse-light",
		languages: ["javascript", "typescript", "vue", "json", "css", "html"],
	};

	const currentOptions = ref({ ...defaultOptions, ...options });

	const isSupported = computed(() => {
		return (
			typeof window !== "undefined" &&
			"document" in window &&
			typeof MarkdownIt !== "undefined"
		);
	});

	const initializeMarkdown = async () => {
		if (!isSupported.value) {
			error.value = new Error("Markdown rendering not supported");
			return;
		}

		if (md.value) return;

		isLoading.value = true;
		error.value = null;

		try {
			// Create basic markdown-it instance
			const options: any = {};
			if (currentOptions.value.html !== undefined)
				options.html = currentOptions.value.html;
			if (currentOptions.value.linkify !== undefined)
				options.linkify = currentOptions.value.linkify;
			if (currentOptions.value.typographer !== undefined)
				options.typographer = currentOptions.value.typographer;
			if (currentOptions.value.breaks !== undefined)
				options.breaks = currentOptions.value.breaks;
			if (currentOptions.value.quotes !== undefined)
				options.quotes = currentOptions.value.quotes;

			const markdownIt = new MarkdownIt(options);

			// Add syntax highlighting if enabled
			if (currentOptions.value.highlight) {
				const highlighter = await createHighlighterCore({
					themes: [
						import("@shikijs/themes/vitesse-light"),
						import("@shikijs/themes/vitesse-dark"),
					],
					langs: currentOptions.value.languages?.map((lang) => {
						// Map language names to shiki imports
						const langMap: Record<string, any> = {
							javascript: import("@shikijs/langs/javascript"),
							typescript: import("@shikijs/langs/typescript"),
							vue: import("@shikijs/langs/vue"),
							json: import("@shikijs/langs/json"),
							css: import("@shikijs/langs/css"),
							html: import("@shikijs/langs/html"),
							python: import("@shikijs/langs/python"),
							bash: import("@shikijs/langs/bash"),
							powershell: import("@shikijs/langs/powershell"),
							sql: import("@shikijs/langs/sql"),
							yaml: import("@shikijs/langs/yaml"),
							toml: import("@shikijs/langs/toml"),
							markdown: import("@shikijs/langs/markdown"),
							regex: import("@shikijs/langs/regex"),
							xml: import("@shikijs/langs/xml"),
						};
						return langMap[lang] || import("@shikijs/langs/javascript");
					}),
					engine: createOnigurumaEngine(() => import("shiki/wasm")),
				});

				markdownIt.use(
					fromHighlighter(highlighter as any, {
						theme: currentOptions.value.theme || "vitesse-light",
					}),
				);
			}

			md.value = markdownIt;
		} catch (err) {
			error.value = err as Error;
			console.warn("Failed to initialize markdown renderer:", err);

			// Fallback to basic markdown-it without highlighting
			try {
				const fallbackOptions: any = {};
				if (currentOptions.value.html !== undefined)
					fallbackOptions.html = currentOptions.value.html;
				if (currentOptions.value.linkify !== undefined)
					fallbackOptions.linkify = currentOptions.value.linkify;
				if (currentOptions.value.typographer !== undefined)
					fallbackOptions.typographer = currentOptions.value.typographer;
				if (currentOptions.value.breaks !== undefined)
					fallbackOptions.breaks = currentOptions.value.breaks;
				if (currentOptions.value.quotes !== undefined)
					fallbackOptions.quotes = currentOptions.value.quotes;

				md.value = new MarkdownIt(fallbackOptions);
			} catch (fallbackErr) {
				error.value = fallbackErr as Error;
			}
		} finally {
			isLoading.value = false;
		}
	};

	const render = (markdownText: string): string => {
		if (!md.value) {
			return markdownText;
		}

		try {
			return md.value.render(markdownText);
		} catch (err) {
			error.value = err as Error;
			return markdownText; // Return original text on error
		}
	};

	const setOptions = (newOptions: Partial<MarkdownRenderOptions>) => {
		currentOptions.value = { ...currentOptions.value, ...newOptions };

		// Reinitialize if highlight or theme options changed
		if (
			newOptions.highlight !== undefined ||
			newOptions.theme !== undefined ||
			newOptions.languages
		) {
			md.value = null;
			initializeMarkdown();
		} else if (md.value) {
			// Update basic options
			const updateOptions: any = {};
			if (currentOptions.value.html !== undefined)
				updateOptions.html = currentOptions.value.html;
			if (currentOptions.value.linkify !== undefined)
				updateOptions.linkify = currentOptions.value.linkify;
			if (currentOptions.value.typographer !== undefined)
				updateOptions.typographer = currentOptions.value.typographer;
			if (currentOptions.value.breaks !== undefined)
				updateOptions.breaks = currentOptions.value.breaks;
			if (currentOptions.value.quotes !== undefined)
				updateOptions.quotes = currentOptions.value.quotes;

			md.value.set(updateOptions);
		}
	};

	// Watch for markdown changes
	watch(
		markdown,
		(newMarkdown) => {
			html.value = render(newMarkdown);
		},
		{ immediate: true },
	);

	// Initialize on creation
	initializeMarkdown();

	return {
		html,
		render,
		setOptions,
		isSupported,
		isLoading,
		error,
	};
}
