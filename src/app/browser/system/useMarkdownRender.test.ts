import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMarkdownRender } from "./useMarkdownRender";

// Mock markdown-it
const mockRender = vi.fn().mockReturnValue("<p>rendered html</p>");
const mockSet = vi.fn();

const mockMarkdownIt = vi.fn().mockImplementation(() => ({
	render: mockRender,
	set: mockSet,
	use: vi.fn(),
}));

// Mock shiki
const mockCreateHighlighterCore = vi.fn().mockResolvedValue({
	loadTheme: vi.fn(),
	loadLanguage: vi.fn(),
});

const mockFromHighlighter = vi.fn().mockReturnValue(() => {});

// Mock dependencies
vi.mock("markdown-it", () => ({
	default: mockMarkdownIt,
}));

vi.mock("@shikijs/markdown-it/core", () => ({
	fromHighlighter: mockFromHighlighter,
}));

vi.mock("shiki/core", () => ({
	createHighlighterCore: mockCreateHighlighterCore,
}));

vi.mock("shiki/engine/oniguruma", () => ({
	createOnigurumaEngine: vi.fn(() => import("shiki/wasm")),
}));

// Mock window and document
Object.defineProperty(window, "document", {
	value: {
		createElement: vi.fn(),
	},
	writable: true,
});

describe("useMarkdownRender", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should detect markdown support", () => {
		const { isSupported } = useMarkdownRender();
		expect(isSupported.value).toBe(true);
	});

	it("should initialize with default options", async () => {
		const { isLoading, error } = useMarkdownRender();

		// Wait for initialization
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(isLoading.value).toBe(false);
		expect(error.value).toBe(null);
		expect(mockMarkdownIt).toHaveBeenCalledWith({
			html: true,
			linkify: true,
			typographer: true,
			breaks: false,
			quotes: "\"\"''",
		});
	});

	it("should initialize with custom options", async () => {
		const options = {
			html: false,
			linkify: false,
			theme: "vitesse-dark",
			languages: ["python", "bash"],
		};

		const { isLoading } = useMarkdownRender(options);

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(isLoading.value).toBe(false);
		expect(mockMarkdownIt).toHaveBeenCalledWith({
			html: false,
			linkify: false,
			typographer: true,
			breaks: false,
			quotes: "\"\"''",
		});
	});

	it("should render markdown to html", async () => {
		const { render } = useMarkdownRender();

		await new Promise((resolve) => setTimeout(resolve, 0));

		const result = render("# Hello World");

		expect(result).toBe("<p>rendered html</p>");
		expect(mockRender).toHaveBeenCalledWith("# Hello World");
	});

	it("should update html when markdown changes", async () => {
		const { render } = useMarkdownRender();

		await new Promise((resolve) => setTimeout(resolve, 0));

		// Test render function directly
		const result = render("# Test");
		expect(result).toBe("<p>rendered html</p>");
	});

	it("should set new options", async () => {
		const { setOptions } = useMarkdownRender();

		await new Promise((resolve) => setTimeout(resolve, 0));

		setOptions({
			html: false,
			linkify: false,
		});

		expect(mockSet).toHaveBeenCalledWith({
			html: false,
			linkify: false,
			typographer: true,
			breaks: false,
			quotes: "\"\"''",
		});
	});

	it("should reinitialize when highlight options change", async () => {
		const { setOptions } = useMarkdownRender();

		await new Promise((resolve) => setTimeout(resolve, 0));

		// Clear previous calls
		mockMarkdownIt.mockClear();

		setOptions({
			theme: "vitesse-dark",
		});

		expect(mockMarkdownIt).toHaveBeenCalled();
	});

	it("should handle render errors gracefully", () => {
		const errorMessage = "Render error";
		mockRender.mockImplementation(() => {
			throw new Error(errorMessage);
		});

		const { render, error } = useMarkdownRender();

		const result = render("# Test");

		expect(result).toBe("# Test"); // Returns original text
		expect(error.value?.message).toBe(errorMessage);
	});

	it("should handle initialization errors", async () => {
		const initError = new Error("Init failed");
		mockMarkdownIt.mockImplementation(() => {
			throw initError;
		});

		const { isLoading, error } = useMarkdownRender();

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(isLoading.value).toBe(false);
		expect(error.value).toBe(initError);
	});

	it("should fallback to basic markdown-it if shiki fails", async () => {
		// First call throws error, second call succeeds
		let callCount = 0;
		mockMarkdownIt.mockImplementation(() => {
			callCount++;
			if (callCount === 1) {
				throw new Error("Shiki failed");
			}
			return {
				render: mockRender,
				set: mockSet,
				use: vi.fn(),
			};
		});

		const { isLoading, error } = useMarkdownRender();

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(isLoading.value).toBe(false);
		expect(error.value).toBe(null); // Should recover with fallback
		expect(mockMarkdownIt).toHaveBeenCalledTimes(2);
	});

	it("should support multiple languages", async () => {
		const options = {
			languages: ["javascript", "typescript", "vue", "python"],
		};

		const { isLoading } = useMarkdownRender(options);

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(isLoading.value).toBe(false);
		expect(mockCreateHighlighterCore).toHaveBeenCalledWith(
			expect.objectContaining({
				langs: expect.arrayContaining([
					expect.any(Promise),
					expect.any(Promise),
					expect.any(Promise),
					expect.any(Promise),
				]),
			}),
		);
	});

	it("should handle unsupported environment", () => {
		// Mock unsupported environment
		const originalWindow = global.window;
		delete (global as any).window;

		const { isSupported, render } = useMarkdownRender();

		expect(isSupported.value).toBe(false);
		expect(render("# Test")).toBe("# Test"); // Returns original text

		// Restore
		global.window = originalWindow;
	});
});
