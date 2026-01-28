import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMarkdownEditor } from "./useMarkdownEditor";

describe("useMarkdownEditor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with default options", () => {
		const editor = useMarkdownEditor();

		expect(editor.content.value).toBe("");
		expect(editor.isEmpty.value).toBe(true);
		expect(editor.wordCount.value).toBe(0);
		expect(editor.characterCount.value).toBe(0);
		expect(editor.lineCount.value).toBe(0);
		expect(editor.showToolbar.value).toBe(true);
		expect(editor.showPreview.value).toBe(true);
		expect(editor.splitViewEnabled.value).toBe(true);
	});

	it("should initialize with custom options", () => {
		const editor = useMarkdownEditor({
			initialContent: "# Hello World",
			placeholder: "Type something...",
			toolbar: false,
			preview: false,
			splitView: false,
		});

		expect(editor.content.value).toBe("# Hello World");
		expect(editor.isEmpty.value).toBe(false);
		expect(editor.wordCount.value).toBe(2);
		expect(editor.showToolbar.value).toBe(false);
		expect(editor.showPreview.value).toBe(false);
		expect(editor.splitViewEnabled.value).toBe(false);
	});

	it("should calculate word count correctly", () => {
		const editor = useMarkdownEditor();

		editor.setContent("Hello world");
		expect(editor.wordCount.value).toBe(2);

		editor.setContent("Hello   world   test");
		expect(editor.wordCount.value).toBe(3);

		editor.setContent("");
		expect(editor.wordCount.value).toBe(0);
	});

	it("should calculate character and line count correctly", () => {
		const editor = useMarkdownEditor();

		editor.setContent("Hello\nworld\ntest");
		expect(editor.characterCount.value).toBe(17);
		expect(editor.lineCount.value).toBe(3);

		editor.setContent("");
		expect(editor.characterCount.value).toBe(0);
		expect(editor.lineCount.value).toBe(0);
	});

	it("should execute bold command", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello world");

		// Mock selection
		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 0, end: 5 });

		editor.commands.bold();

		expect(editor.content.value).toBe("**Hello** world");
	});

	it("should execute italic command", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello world");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 0, end: 5 });

		editor.commands.italic();

		expect(editor.content.value).toBe("*Hello* world");
	});

	it("should execute strikethrough command", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello world");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 0, end: 5 });

		editor.commands.strikethrough();

		expect(editor.content.value).toBe("~~Hello~~ world");
	});

	it("should execute heading command", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello world");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 0, end: 5 });

		editor.commands.heading(2);

		expect(editor.content.value).toBe("## Hello world");
	});

	it("should execute code command", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello world");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 0, end: 5 });

		editor.commands.code();

		expect(editor.content.value).toBe("`Hello` world");
	});

	it("should execute quote command", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello world");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 0, end: 5 });

		editor.commands.quote();

		expect(editor.content.value).toBe("> Hello world");
	});

	it("should execute list command", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello world");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 0, end: 5 });

		editor.commands.list(false);

		expect(editor.content.value).toBe("- Hello world");

		editor.commands.list(true);

		expect(editor.content.value).toBe("1. Hello world");
	});

	it("should execute link command", () => {
		const editor = useMarkdownEditor();

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 0, end: 0 });

		editor.commands.link("https://example.com", "Example");

		expect(editor.content.value).toBe("[Example](https://example.com)");
	});

	it("should execute image command", () => {
		const editor = useMarkdownEditor();

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 0, end: 0 });

		editor.commands.image("https://example.com/image.jpg", "Alt text");

		expect(editor.content.value).toBe(
			"[Alt text](https://example.com/image.jpg)",
		);
	});

	it("should execute horizontal rule command", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 5, end: 5 });

		editor.commands.horizontalRule();

		expect(editor.content.value).toBe("Hello\n---\n");
	});

	it("should execute table command", () => {
		const editor = useMarkdownEditor();

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 0, end: 0 });

		editor.commands.table(2, 3);

		const expectedTable =
			"| Header | Header | Header |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n";
		expect(editor.content.value).toBe(expectedTable);
	});

	it("should handle undo and redo", () => {
		const editor = useMarkdownEditor();

		editor.setContent("First");
		expect(editor.content.value).toBe("First");
		expect(editor.canUndo.value).toBe(true);

		editor.setContent("Second");
		expect(editor.content.value).toBe("Second");

		editor.commands.undo();
		expect(editor.content.value).toBe("First");
		expect(editor.canRedo.value).toBe(true);

		editor.commands.redo();
		expect(editor.content.value).toBe("Second");
	});

	it("should clear content", () => {
		const editor = useMarkdownEditor({ initialContent: "Hello world" });

		editor.clearContent();

		expect(editor.content.value).toBe("");
		expect(editor.isEmpty.value).toBe(true);
	});

	it("should reset content to initial", () => {
		const editor = useMarkdownEditor({ initialContent: "Initial" });

		editor.setContent("Modified");
		expect(editor.content.value).toBe("Modified");
		expect(editor.isDirty.value).toBe(true);

		editor.resetContent();

		expect(editor.content.value).toBe("Initial");
		expect(editor.isDirty.value).toBe(false);
	});

	it("should toggle preview mode", () => {
		const editor = useMarkdownEditor();

		expect(editor.isPreviewMode.value).toBe(false);

		editor.togglePreview();

		expect(editor.isPreviewMode.value).toBe(true);

		editor.togglePreview();

		expect(editor.isPreviewMode.value).toBe(false);
	});

	it("should toggle fullscreen", () => {
		const editor = useMarkdownEditor();

		expect(editor.isFullscreen.value).toBe(false);

		editor.toggleFullscreen();

		expect(editor.isFullscreen.value).toBe(true);
	});

	it("should toggle toolbar", () => {
		const editor = useMarkdownEditor();

		expect(editor.showToolbar.value).toBe(true);

		editor.toggleToolbar();

		expect(editor.showToolbar.value).toBe(false);
	});

	it("should toggle preview panel", () => {
		const editor = useMarkdownEditor();

		expect(editor.showPreview.value).toBe(true);

		editor.togglePreviewPanel();

		expect(editor.showPreview.value).toBe(false);
	});

	it("should toggle split view", () => {
		const editor = useMarkdownEditor();

		expect(editor.splitViewEnabled.value).toBe(true);

		editor.toggleSplitView();

		expect(editor.splitViewEnabled.value).toBe(false);
	});

	it("should set theme", () => {
		const editor = useMarkdownEditor();

		expect(editor.currentTheme.value).toBe("auto");

		editor.setTheme("dark");

		expect(editor.currentTheme.value).toBe("dark");

		editor.setTheme("light");

		expect(editor.currentTheme.value).toBe("light");
	});

	it("should paste HTML as markdown", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello ");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 6, end: 6 });

		const html = "<strong>World</strong>";
		editor.commands.pasteHtmlAsMarkdown(html);

		expect(editor.content.value).toBe("Hello **World**");
	});

	it("should paste plain text as markdown", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello ");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 6, end: 6 });

		const text = "World";
		editor.commands.pasteAsMarkdown(text);

		expect(editor.content.value).toBe("Hello World");
	});

	it("should handle paste event with HTML data", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello ");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 6, end: 6 });

		const event = {
			preventDefault: vi.fn(),
			clipboardData: {
				getData: vi.fn((type: string) => {
					if (type === "text/html") return "<strong>World</strong>";
					if (type === "text/plain") return "World";
					return "";
				}),
			},
		} as any;

		editor.handlePaste(event);

		expect(event.preventDefault).toHaveBeenCalled();
		expect(editor.content.value).toBe("Hello **World**");
	});

	it("should handle paste event with plain text only", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello ");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 6, end: 6 });

		const event = {
			preventDefault: vi.fn(),
			clipboardData: {
				getData: vi.fn((type: string) => {
					if (type === "text/html") return "";
					if (type === "text/plain") return "World";
					return "";
				}),
			},
		} as any;

		editor.handlePaste(event);

		expect(event.preventDefault).toHaveBeenCalled();
		expect(editor.content.value).toBe("Hello World");
	});

	it("should handle drop event with HTML data", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello ");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 6, end: 6 });

		const event = {
			preventDefault: vi.fn(),
			dataTransfer: {
				getData: vi.fn((type: string) => {
					if (type === "text/html") return "<strong>World</strong>";
					if (type === "text/plain") return "World";
					return "";
				}),
			},
		} as any;

		editor.handleDrop(event);

		expect(event.preventDefault).toHaveBeenCalled();
		expect(editor.content.value).toBe("Hello **World**");
	});

	it("should respect maxLength limit", async () => {
		const editor = useMarkdownEditor({ maxLength: 10 });

		editor.setContent("1234567890");
		expect(editor.content.value).toBe("1234567890");

		editor.setContent("12345678901");
		expect(editor.content.value).toBe("1234567890");
	});

	it("should insert text at cursor position", () => {
		const editor = useMarkdownEditor();
		editor.setContent("Hello");

		vi.spyOn(editor, "getSelection").mockReturnValue({ start: 5, end: 5 });

		editor.insertText(" world");

		expect(editor.content.value).toBe("Hello world");
	});
});
