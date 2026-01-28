import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useClipboard } from "./useClipboard";

describe("useClipboard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should initialize with default values", () => {
		const { isSupported, text, copied, error } = useClipboard();

		expect(isSupported.value).toBe(true);
		expect(text.value).toBe("");
		expect(copied.value).toBe(false);
		expect(error.value).toBe(null);
	});

	it("should handle unsupported browser", () => {
		vi.stubGlobal("navigator", { clipboard: undefined });

		const { isSupported } = useClipboard();

		expect(isSupported.value).toBe(false);

		vi.unstubAllGlobals();
	});

	it("should copy text using modern Clipboard API", async () => {
		const mockWriteText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: { writeText: mockWriteText },
		});

		const { copy, text, copied } = useClipboard({ legacy: false });

		const result = await copy("test text");

		expect(result).toBe(true);
		expect(mockWriteText).toHaveBeenCalledWith("test text");
		expect(text.value).toBe("test text");
		expect(copied.value).toBe(true);

		vi.unstubAllGlobals();
	});

	it("should copy text using legacy method", async () => {
		const mockExecCommand = vi.fn(() => true);
		vi.stubGlobal("document", {
			createElement: vi.fn(() => ({
				value: "",
				style: { position: "", left: "", top: "" },
				focus: vi.fn(),
				select: vi.fn(),
			})),
			body: {
				appendChild: vi.fn(),
				removeChild: vi.fn(),
			},
			execCommand: mockExecCommand,
			getSelection: vi.fn(() => ({
				toString: vi.fn(() => ""),
				removeAllRanges: vi.fn(),
				selectAllChildren: vi.fn(),
			})),
		});

		const { copy, text, copied } = useClipboard({ legacy: true });

		const result = await copy("test text");

		expect(result).toBe(true);
		expect(mockExecCommand).toHaveBeenCalledWith("copy");
		expect(text.value).toBe("test text");
		expect(copied.value).toBe(true);

		vi.unstubAllGlobals();
	});

	it("should handle copy errors", async () => {
		const mockWriteText = vi.fn().mockRejectedValue(new Error("Copy failed"));
		vi.stubGlobal("navigator", {
			clipboard: { writeText: mockWriteText },
		});

		const { copy, copied, error } = useClipboard({ legacy: false });

		const result = await copy("test text");

		expect(result).toBe(false);
		expect(copied.value).toBe(false);
		expect(error.value).toBe("Copy failed");

		vi.unstubAllGlobals();
	});

	it("should cut text", async () => {
		const mockWriteText = vi.fn().mockResolvedValue(undefined);
		const mockSelection = {
			toString: vi.fn(() => "selected text"),
			removeAllRanges: vi.fn(),
		};
		vi.stubGlobal("navigator", {
			clipboard: { writeText: mockWriteText },
		});
		vi.stubGlobal("document", {
			getSelection: vi.fn(() => mockSelection),
		});

		const { cut, text, copied } = useClipboard();

		const result = await cut();

		expect(result).toBe(true);
		expect(mockWriteText).toHaveBeenCalledWith("selected text");
		expect(mockSelection.removeAllRanges).toHaveBeenCalled();
		expect(text.value).toBe("selected text");
		expect(copied.value).toBe(true);

		vi.unstubAllGlobals();
	});

	it("should paste text", async () => {
		const mockReadText = vi.fn().mockResolvedValue("clipboard content");
		vi.stubGlobal("navigator", {
			clipboard: { readText: mockReadText },
		});

		const { paste, text } = useClipboard();

		const result = await paste();

		expect(result).toBe("clipboard content");
		expect(mockReadText).toHaveBeenCalled();
		expect(text.value).toBe("clipboard content");

		vi.unstubAllGlobals();
	});

	it("should handle paste errors", async () => {
		const mockReadText = vi.fn().mockRejectedValue(new Error("Paste failed"));
		vi.stubGlobal("navigator", {
			clipboard: { readText: mockReadText },
		});

		const { paste, error } = useClipboard();

		const result = await paste();

		expect(result).toBe("");
		expect(error.value).toBe("Paste failed");

		vi.unstubAllGlobals();
	});

	it("should clear state", () => {
		const { clear, text, copied, error } = useClipboard();

		// Simulate a successful copy
		text.value = "test";
		copied.value = true;
		error.value = "some error";

		clear();

		expect(text.value).toBe("");
		expect(copied.value).toBe(false);
		expect(error.value).toBe(null);
	});

	it("should reset copied state after timeout", async () => {
		const { copy, copied } = useClipboard({ timeout: 1000 });

		// Mock successful copy
		vi.stubGlobal("navigator", {
			clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
		});

		await copy("test");
		expect(copied.value).toBe(true);

		vi.advanceTimersByTime(1000);
		expect(copied.value).toBe(false);

		vi.unstubAllGlobals();
	});

	it("should get selected text", () => {
		const mockSelection = {
			toString: vi.fn(() => "selected text"),
		};
		vi.stubGlobal("document", {
			getSelection: vi.fn(() => mockSelection),
		});

		const { getSelectedText } = useClipboard();

		const result = getSelectedText();

		expect(result).toBe("selected text");
		expect(mockSelection.toString).toHaveBeenCalled();

		vi.unstubAllGlobals();
	});

	it("should select all text", () => {
		const mockSelection = {
			selectAllChildren: vi.fn(),
		};
		vi.stubGlobal("document", {
			getSelection: vi.fn(() => mockSelection),
		});

		const { selectAll } = useClipboard();

		selectAll();

		expect(mockSelection.selectAllChildren).toHaveBeenCalledWith(document.body);

		vi.unstubAllGlobals();
	});

	it("should copy element content", async () => {
		const mockElement = {
			textContent: "element text",
			innerText: "element text",
		};
		const mockWriteText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: { writeText: mockWriteText },
		});

		const { copyElement } = useClipboard();

		const result = await copyElement(mockElement as unknown as Element);

		expect(result).toBe(true);
		expect(mockWriteText).toHaveBeenCalledWith("element text");

		vi.unstubAllGlobals();
	});

	it("should copy input element value", async () => {
		const mockInput = {
			value: "input value",
		} as HTMLInputElement;
		const mockWriteText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: { writeText: mockWriteText },
		});

		const { copyElementValue } = useClipboard();

		const result = await copyElementValue(mockInput);

		expect(result).toBe(true);
		expect(mockWriteText).toHaveBeenCalledWith("input value");

		vi.unstubAllGlobals();
	});

	it("should copy HTML", async () => {
		const mockWrite = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: { write: mockWrite },
		});
		vi.stubGlobal("ClipboardItem", vi.fn());
		vi.stubGlobal("Blob", vi.fn());

		const { copyHTML, copied } = useClipboard();

		const result = await copyHTML("<p>test</p>");

		expect(result).toBe(true);
		expect(mockWrite).toHaveBeenCalled();
		expect(copied.value).toBe(true);

		vi.unstubAllGlobals();
	});

	it("should copy rich text", async () => {
		const mockWrite = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: { write: mockWrite },
		});
		vi.stubGlobal("ClipboardItem", vi.fn());
		vi.stubGlobal("Blob", vi.fn());

		const { copyRichText } = useClipboard();

		const result = await copyRichText("plain text", "<p>rich text</p>");

		expect(result).toBe(true);
		expect(mockWrite).toHaveBeenCalled();

		vi.unstubAllGlobals();
	});

	it("should request permission", async () => {
		const mockQuery = vi.fn().mockResolvedValue({ state: "granted" });
		vi.stubGlobal("navigator", {
			permissions: { query: mockQuery },
		});

		const { requestPermission } = useClipboard();

		const result = await requestPermission();

		expect(result).toBe(true);
		expect(mockQuery).toHaveBeenCalledWith({ name: "clipboard-write" });

		vi.unstubAllGlobals();
	});

	it("should handle permission API not available", async () => {
		vi.stubGlobal("navigator", {});

		const { requestPermission } = useClipboard();

		const result = await requestPermission();

		expect(result).toBe(true);

		vi.unstubAllGlobals();
	});

	it("should handle permission check errors", async () => {
		const mockQuery = vi.fn().mockRejectedValue(new Error("Permission error"));
		vi.stubGlobal("navigator", {
			permissions: { query: mockQuery },
		});

		const { requestPermission } = useClipboard();

		const result = await requestPermission();

		expect(result).toBe(true); // Should return true on error

		vi.unstubAllGlobals();
	});

	it("should handle cut operation not supported", async () => {
		vi.stubGlobal("navigator", { clipboard: undefined });

		const { cut, error } = useClipboard();

		const result = await cut();

		expect(result).toBe(false);
		expect(error.value).toBe("Cut operation not supported");

		vi.unstubAllGlobals();
	});

	it("should handle paste operation not supported", async () => {
		vi.stubGlobal("navigator", { clipboard: undefined });

		const { paste, error } = useClipboard();

		const result = await paste();

		expect(result).toBe("");
		expect(error.value).toBe("Paste operation not supported");

		vi.unstubAllGlobals();
	});

	it("should use legacy fallback when modern API fails", async () => {
		const mockWriteText = vi.fn().mockRejectedValue(new Error("Not supported"));
		const mockExecCommand = vi.fn(() => true);

		vi.stubGlobal("navigator", {
			clipboard: { writeText: mockWriteText },
		});
		vi.stubGlobal("document", {
			createElement: vi.fn(() => ({
				value: "",
				style: { position: "", left: "", top: "" },
				focus: vi.fn(),
				select: vi.fn(),
			})),
			body: {
				appendChild: vi.fn(),
				removeChild: vi.fn(),
			},
			execCommand: mockExecCommand,
			getSelection: vi.fn(() => ({
				toString: vi.fn(() => ""),
				removeAllRanges: vi.fn(),
				selectAllChildren: vi.fn(),
			})),
		});

		const { copy, text, copied } = useClipboard({ legacy: true });

		const result = await copy("test text");

		expect(result).toBe(true);
		expect(mockExecCommand).toHaveBeenCalledWith("copy");
		expect(text.value).toBe("test text");
		expect(copied.value).toBe(true);

		vi.unstubAllGlobals();
	});
});
