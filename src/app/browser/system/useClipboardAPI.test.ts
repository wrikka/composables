import { beforeEach, describe, expect, it, vi } from "vitest";
import { useClipboardAPI } from "./useClipboardAPI";

// Mock Clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined);
const mockReadText = vi.fn().mockResolvedValue("test content");
const mockWrite = vi.fn().mockResolvedValue(undefined);

Object.defineProperty(navigator, "clipboard", {
	value: {
		writeText: mockWriteText,
		readText: mockReadText,
		write: mockWrite,
	},
	writable: true,
});

// Mock ClipboardItem and Blob
global.ClipboardItem = vi.fn().mockImplementation((data) => ({
	data,
	supports: vi.fn().mockReturnValue(true),
})) as any;

global.Blob = vi.fn().mockImplementation((content, options) => ({
	content,
	type: options?.type,
}));

describe("useClipboardAPI", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should detect clipboard API support", () => {
		const { isSupported } = useClipboardAPI();
		expect(isSupported.value).toBe(true);
	});

	it("should copy text successfully", async () => {
		const onSuccess = vi.fn();
		const { copy, error } = useClipboardAPI({ onSuccess });

		const result = await copy("test text");

		expect(result).toBe(true);
		expect(error.value).toBe(null);
		expect(mockWriteText).toHaveBeenCalledWith("test text");
		expect(onSuccess).toHaveBeenCalled();
	});

	it("should handle copy error", async () => {
		const onError = vi.fn();
		const testError = new Error("Copy failed");
		mockWriteText.mockRejectedValue(testError);

		const { copy, error } = useClipboardAPI({ onError });

		const result = await copy("test text");

		expect(result).toBe(false);
		expect(error.value).toBe(testError);
		expect(onError).toHaveBeenCalledWith(testError);
	});

	it("should paste text successfully", async () => {
		const { paste, error } = useClipboardAPI();

		const result = await paste();

		expect(result).toBe("test content");
		expect(error.value).toBe(null);
		expect(mockReadText).toHaveBeenCalled();
	});

	it("should handle paste error", async () => {
		const onError = vi.fn();
		const testError = new Error("Paste failed");
		mockReadText.mockRejectedValue(testError);

		const { paste, error } = useClipboardAPI({ onError });

		const result = await paste();

		expect(result).toBe(null);
		expect(error.value).toBe(testError);
		expect(onError).toHaveBeenCalledWith(testError);
	});

	it("should copy HTML successfully", async () => {
		const { copyHTML, error } = useClipboardAPI();

		const result = await copyHTML("<p>test html</p>");

		expect(result).toBe(true);
		expect(error.value).toBe(null);
		expect(Blob).toHaveBeenCalledWith(["<p>test html</p>"], {
			type: "text/html",
		});
		expect(ClipboardItem).toHaveBeenCalled();
		expect(mockWrite).toHaveBeenCalled();
	});

	it("should copy image successfully", async () => {
		const { copyImage, error } = useClipboardAPI();

		const imageData = new Blob(["image data"], { type: "image/png" });
		const result = await copyImage(imageData);

		expect(result).toBe(true);
		expect(error.value).toBe(null);
		expect(ClipboardItem).toHaveBeenCalledWith({ "image/png": imageData });
		expect(mockWrite).toHaveBeenCalled();
	});

	it("should clear clipboard successfully", async () => {
		const { clear, error } = useClipboardAPI();

		const result = await clear();

		expect(result).toBe(true);
		expect(error.value).toBe(null);
		expect(mockWriteText).toHaveBeenCalledWith("");
	});

	it("should handle unsupported API", () => {
		delete (navigator as any).clipboard;

		const { isSupported, copy } = useClipboardAPI();

		expect(isSupported.value).toBe(false);

		copy("test").then((result) => {
			expect(result).toBe(false);
		});

		// Restore
		Object.defineProperty(navigator, "clipboard", {
			value: {
				writeText: mockWriteText,
				readText: mockReadText,
				write: mockWrite,
			},
			writable: true,
		});
	});

	it("should prevent concurrent operations", async () => {
		const { copy } = useClipboardAPI();

		// Start first operation
		const promise1 = copy("text1");

		// Try second operation while first is loading
		const promise2 = copy("text2");

		expect(await promise1).toBe(true);
		expect(await promise2).toBe(false);
		expect(mockWriteText).toHaveBeenCalledTimes(1);
	});
});
