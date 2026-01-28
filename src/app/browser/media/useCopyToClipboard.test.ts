import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCopyToClipboard } from "./useCopyToClipboard";

describe("useCopyToClipboard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with default values", () => {
		const { isSupported, isCopied, error } = useCopyToClipboard();

		expect(isSupported.value).toBe(!!navigator.clipboard);
		expect(isCopied.value).toBe(false);
		expect(error.value).toBe(null);
	});

	it("should copy text successfully", async () => {
		const mockWriteText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: {
				writeText: mockWriteText,
				readText: vi.fn(),
			},
		});

		const { copy, isCopied, error } = useCopyToClipboard();

		const result = await copy("test text");

		expect(result).toBe(true);
		expect(mockWriteText).toHaveBeenCalledWith("test text");
		expect(isCopied.value).toBe(true);
		expect(error.value).toBe(null);

		vi.unstubAllGlobals();
	});

	it("should handle copy failure", async () => {
		const mockWriteText = vi
			.fn()
			.mockRejectedValue(new Error("Permission denied"));
		vi.stubGlobal("navigator", {
			clipboard: {
				writeText: mockWriteText,
				readText: vi.fn(),
			},
		});

		const { copy, isCopied, error } = useCopyToClipboard();

		const result = await copy("test text");

		expect(result).toBe(false);
		expect(isCopied.value).toBe(false);
		expect(error.value).toBe("Permission denied");

		vi.unstubAllGlobals();
	});

	it("should use legacy copy method", () => {
		const mockExecCommand = vi.fn().mockReturnValue(true);
		vi.stubGlobal("document", {
			execCommand: mockExecCommand,
			body: {
				appendChild: vi.fn(),
				removeChild: vi.fn(),
			},
			createElement: vi.fn().mockReturnValue({
				value: "",
				style: {},
				focus: vi.fn(),
				select: vi.fn(),
			}),
		});

		const { copyLegacy, isCopied, error } = useCopyToClipboard();

		const result = copyLegacy("test text");

		expect(result).toBe(true);
		expect(isCopied.value).toBe(true);
		expect(error.value).toBe(null);

		vi.unstubAllGlobals();
	});

	it("should paste text from clipboard", async () => {
		const mockReadText = vi.fn().mockResolvedValue("clipboard content");
		vi.stubGlobal("navigator", {
			clipboard: {
				writeText: vi.fn(),
				readText: mockReadText,
			},
		});

		const { paste, error } = useCopyToClipboard();

		const result = await paste();

		expect(result).toBe("clipboard content");
		expect(error.value).toBe(null);

		vi.unstubAllGlobals();
	});

	it("should clear clipboard", async () => {
		const mockWriteText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: {
				writeText: mockWriteText,
				readText: vi.fn(),
			},
		});

		const { clear, error } = useCopyToClipboard();

		const result = await clear();

		expect(result).toBe(true);
		expect(mockWriteText).toHaveBeenCalledWith("");
		expect(error.value).toBe(null);

		vi.unstubAllGlobals();
	});
});
