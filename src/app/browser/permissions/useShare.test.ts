import { beforeEach, describe, expect, it, vi } from "vitest";
import { useShare } from "./useShare";

// Mock Web Share API
const mockShare = vi.fn();
const mockCanShare = vi.fn().mockReturnValue(true);

Object.defineProperty(navigator, "share", {
	value: mockShare,
	writable: true,
});

Object.defineProperty(navigator, "canShare", {
	value: mockCanShare,
	writable: true,
});

describe("useShare", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should detect share API support", () => {
		const { isSupported } = useShare();
		expect(isSupported.value).toBe(true);
	});

	it("should share data successfully", async () => {
		const onSuccess = vi.fn();
		const { share, isLoading, error } = useShare({ onSuccess });

		const data = { title: "Test", text: "Hello", url: "https://example.com" };
		mockShare.mockResolvedValue(undefined);

		const result = await share(data);

		expect(result).toBe(true);
		expect(isLoading.value).toBe(false);
		expect(error.value).toBe(null);
		expect(mockShare).toHaveBeenCalledWith(data);
		expect(onSuccess).toHaveBeenCalled();
	});

	it("should handle share error", async () => {
		const onError = vi.fn();
		const testError = new Error("Share failed");
		mockShare.mockRejectedValue(testError);

		const { share, error } = useShare({ onError });

		const result = await share({ text: "test" });

		expect(result).toBe(false);
		expect(error.value).toBe(testError);
		expect(onError).toHaveBeenCalledWith(testError);
	});

	it("should handle user cancellation", async () => {
		const cancelError = new Error("User cancelled");
		cancelError.name = "AbortError";
		mockShare.mockRejectedValue(cancelError);

		const { share, error } = useShare();

		const result = await share({ text: "test" });

		expect(result).toBe(false);
		expect(error.value).toBe(null); // Cancellation is not an error
	});

	it("should share text", async () => {
		const { shareText } = useShare();
		mockShare.mockResolvedValue(undefined);

		await shareText("Hello World", "Title");

		expect(mockShare).toHaveBeenCalledWith({
			text: "Hello World",
			title: "Title",
		});
	});

	it("should share URL", async () => {
		const { shareUrl } = useShare();
		mockShare.mockResolvedValue(undefined);

		await shareUrl("https://example.com", "Title", "Description");

		expect(mockShare).toHaveBeenCalledWith({
			url: "https://example.com",
			title: "Title",
			text: "Description",
		});
	});

	it("should share files", async () => {
		const { shareFile } = useShare();
		mockShare.mockResolvedValue(undefined);

		const files = [new File(["content"], "test.txt", { type: "text/plain" })];
		await shareFile(files, "Title", "Description");

		expect(mockShare).toHaveBeenCalledWith({
			files,
			title: "Title",
			text: "Description",
		});
	});

	it("should check if can share", () => {
		const { canShare } = useShare();

		const result = canShare({ text: "test" });

		expect(result).toBe(true);
		expect(mockCanShare).toHaveBeenCalledWith({ text: "test" });
	});

	it("should handle unsupported API", () => {
		const originalShare = navigator.share;
		delete (navigator as any).share;

		const { isSupported, share } = useShare();

		expect(isSupported.value).toBe(false);

		share({ text: "test" }).then((result) => {
			expect(result).toBe(false);
		});

		// Restore
		Object.defineProperty(navigator, "share", {
			value: originalShare,
			writable: true,
		});
	});
});
