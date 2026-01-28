import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAdvancedQRCode, useBatchQRCode, useQRCode } from "./useQRCode";

// Mock canvas
const mockCanvas = {
	width: 0,
	height: 0,
	toDataURL: vi.fn(() => "data:image/png;base64,mock"),
	getContext: vi.fn(() => ({
		fillStyle: "",
		fillRect: vi.fn(),
	})),
};

vi.stubGlobal("document", {
	createElement: vi.fn(() => mockCanvas),
	createElementNS: vi.fn(() => mockCanvas),
});

describe("useQRCode", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with default values", () => {
		const { qrText, qrOptions, qrCode } = useQRCode("test");

		expect(qrText.value).toBe("test");
		expect(qrOptions.value).toEqual({
			width: 256,
			height: 256,
			colorDark: "#000000",
			colorLight: "#ffffff",
			correctLevel: "M",
		});
		expect(qrCode.value).toBe("data:image/png;base64,mock");
	});

	it("should use custom options", () => {
		const { qrOptions } = useQRCode("test", {
			width: 128,
			height: 128,
			colorDark: "#ff0000",
			colorLight: "#00ff00",
			correctLevel: "H",
		});

		expect(qrOptions.value).toEqual({
			width: 128,
			height: 128,
			colorDark: "#ff0000",
			colorLight: "#00ff00",
			correctLevel: "H",
		});
	});

	it("should update text", () => {
		const { qrText, qrCode, updateText } = useQRCode("initial");

		expect(qrText.value).toBe("initial");

		updateText("updated");
		expect(qrText.value).toBe("updated");
		expect(qrCode.value).toBe("data:image/png;base64,mock");
	});

	it("should update options", () => {
		const { qrOptions, updateOptions } = useQRCode("test");

		updateOptions({ width: 512, colorDark: "#ff0000" });

		expect(qrOptions.value).toEqual({
			width: 512,
			height: 256,
			colorDark: "#ff0000",
			colorLight: "#ffffff",
			correctLevel: "M",
		});
	});

	it("should download QR code", () => {
		const mockLink = {
			download: "",
			href: "",
			click: vi.fn(),
		};

		const createElementSpy = vi
			.spyOn(document, "createElement")
			.mockReturnValue(mockLink as any);

		const { downloadQRCode } = useQRCode("test");

		downloadQRCode("custom-qrcode.png");

		expect(createElementSpy).toHaveBeenCalledWith("a");
		expect(mockLink.download).toBe("custom-qrcode.png");
		expect(mockLink.href).toBe("data:image/png;base64,mock");
		expect(mockLink.click).toHaveBeenCalled();

		createElementSpy.mockRestore();
	});

	it("should use default filename when downloading", () => {
		const mockLink = {
			download: "",
			href: "",
			click: vi.fn(),
		};

		const createElementSpy = vi
			.spyOn(document, "createElement")
			.mockReturnValue(mockLink as any);

		const { downloadQRCode } = useQRCode("test");

		downloadQRCode();

		expect(mockLink.download).toBe("qrcode.png");

		createElementSpy.mockRestore();
	});
});

describe("useAdvancedQRCode", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with empty text", () => {
		const { text, qrCode, isGenerating, error } = useAdvancedQRCode();

		expect(text.value).toBe("");
		expect(qrCode.value).toBe(null);
		expect(isGenerating.value).toBe(false);
		expect(error.value).toBe(null);
	});

	it("should generate QR code", () => {
		const { text, qrCode, generate } = useAdvancedQRCode();

		generate("test text");

		expect(text.value).toBe("test text");
		expect(qrCode.value).toBe("data:image/png;base64,mock");
	});

	it("should use custom options", () => {
		const { options, generate } = useAdvancedQRCode();

		generate("test", { width: 128, colorDark: "#ff0000" });

		expect(options.value.width).toBe(128);
		expect(options.value.colorDark).toBe("#ff0000");
	});

	it("should clear QR code", () => {
		const { text, qrCode, error, generate, clear } = useAdvancedQRCode();

		generate("test");
		expect(text.value).toBe("test");
		expect(qrCode.value).toBe("data:image/png;base64,mock");

		clear();
		expect(text.value).toBe("");
		expect(qrCode.value).toBe(null);
		expect(error.value).toBe(null);
	});

	it("should handle generation errors", () => {
		// Mock canvas to throw error
		const mockErrorCanvas = {
			width: 0,
			height: 0,
			toDataURL: vi.fn(() => {
				throw new Error("Generation failed");
			}),
			getContext: vi.fn(() => ({
				fillStyle: "",
				fillRect: vi.fn(),
			})),
		};

		vi.spyOn(document, "createElement").mockReturnValue(mockErrorCanvas as any);

		const { qrCode, error, generate } = useAdvancedQRCode();

		generate("test");

		expect(qrCode.value).toBe(null);
		expect(error.value).toBe("Generation failed");
	});
});

describe("useBatchQRCode", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should initialize with empty items", () => {
		const { items, isGenerating, progress } = useBatchQRCode();

		expect(items.value).toEqual([]);
		expect(isGenerating.value).toBe(false);
		expect(progress.value).toBe(0);
	});

	it("should generate batch QR codes", async () => {
		const { items, isGenerating, progress, generateBatch } = useBatchQRCode();

		const promise = generateBatch(["text1", "text2", "text3"]);

		expect(isGenerating.value).toBe(true);

		await vi.runAllTimersAsync();

		expect(items.value).toHaveLength(3);
		expect(items.value[0]).toMatchObject({
			id: "qr-0",
			text: "text1",
			qrCode: "data:image/png;base64,mock",
		});
		expect(isGenerating.value).toBe(false);
		expect(progress.value).toBe(100);

		await promise;
	});

	it("should use custom options for batch", async () => {
		const { options, generateBatch } = useBatchQRCode();

		await generateBatch(["text1"], { width: 128, colorDark: "#ff0000" });

		expect(options.value.width).toBe(128);
		expect(options.value.colorDark).toBe("#ff0000");
	});

	it("should clear batch items", () => {
		const { items, progress, generateBatch, clear } = useBatchQRCode();

		generateBatch(["text1", "text2"]);
		vi.runAllTimers();

		expect(items.value).toHaveLength(2);
		expect(progress.value).toBe(100);

		clear();
		expect(items.value).toEqual([]);
		expect(progress.value).toBe(0);
	});

	it("should download all QR codes", () => {
		const mockLinks: any[] = [];
		const createElementSpy = vi
			.spyOn(document, "createElement")
			.mockImplementation(() => {
				const link = {
					download: "",
					href: "",
					click: vi.fn(),
				};
				mockLinks.push(link);
				return link as any;
			});

		const { generateBatch, downloadAll } = useBatchQRCode();

		generateBatch(["text1", "text2"]);
		vi.runAllTimers();

		downloadAll();

		expect(mockLinks).toHaveLength(2);
		expect(mockLinks[0].download).toBe("qrcode-1.png");
		expect(mockLinks[1].download).toBe("qrcode-2.png");
		expect(mockLinks[0].click).toHaveBeenCalled();
		expect(mockLinks[1].click).toHaveBeenCalled();

		createElementSpy.mockRestore();
	});

	it("should handle empty batch", async () => {
		const { items, generateBatch } = useBatchQRCode();

		await generateBatch([]);

		expect(items.value).toEqual([]);
	});

	it("should update progress during generation", async () => {
		const { progress, generateBatch } = useBatchQRCode();

		const promise = generateBatch(["text1", "text2", "text3", "text4"]);

		// Check progress updates
		await vi.advanceTimersByTimeAsync(0);
		expect(progress.value).toBe(25); // 1/4

		await vi.advanceTimersByTimeAsync(0);
		expect(progress.value).toBe(50); // 2/4

		await vi.advanceTimersByTimeAsync(0);
		expect(progress.value).toBe(75); // 3/4

		await vi.advanceTimersByTimeAsync(0);
		expect(progress.value).toBe(100); // 4/4

		await promise;
	});
});
