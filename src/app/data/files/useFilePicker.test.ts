import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFilePicker } from "./useFilePicker";

describe("useFilePicker", () => {
	let mockInput: any;
	let mockFiles: File[];

	beforeEach(() => {
		vi.clearAllMocks();

		mockFiles = [
			new File(["content1"], "image.jpg", { type: "image/jpeg" }),
			new File(["content2"], "document.pdf", { type: "application/pdf" }),
			new File(["content3"], "audio.mp3", { type: "audio/mpeg" }),
		];

		mockInput = {
			type: "",
			accept: "",
			multiple: false,
			style: { display: "" },
			addEventListener: vi.fn(),
			setAttribute: vi.fn(),
			click: vi.fn(),
		};

		vi.spyOn(document, "createElement").mockReturnValue(mockInput);
		vi.spyOn(document.body, "appendChild").mockReturnValue(mockInput as any);
		vi.spyOn(document.body, "removeChild").mockReturnValue(mockInput as any);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should initialize with default values", () => {
		const { isOpen, selectedFiles, error } = useFilePicker({});

		expect(isOpen.value).toBe(false);
		expect(selectedFiles.value).toEqual([]);
		expect(error.value).toBe(null);
	});

	it("should use custom options", () => {
		const { pickFiles } = useFilePicker({
			accept: "image/*",
			multiple: true,
			capture: "camera",
		});

		pickFiles();

		expect(mockInput.accept).toBe("image/*");
		expect(mockInput.multiple).toBe(true);
		expect(mockInput.setAttribute).toHaveBeenCalledWith("capture", "camera");
	});

	it("should pick files successfully", async () => {
		const { pickFiles, selectedFiles } = useFilePicker();

		const promise = pickFiles();

		// Simulate file selection
		const changeEvent = { target: { files: mockFiles } };
		const changeCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "change",
		)?.[1];
		changeCallback(changeEvent);

		const result = await promise;

		expect(result.files).toEqual(mockFiles);
		expect(result.canceled).toBe(false);
		expect(selectedFiles.value).toEqual(mockFiles);
		expect(document.body.removeChild).toHaveBeenCalledWith(mockInput);
	});

	it("should handle file picker cancellation", async () => {
		const { pickFiles, selectedFiles } = useFilePicker();

		const promise = pickFiles();

		// Simulate cancellation
		const cancelCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "cancel",
		)?.[1];
		cancelCallback();

		const result = await promise;

		expect(result.files).toEqual([]);
		expect(result.canceled).toBe(true);
		expect(selectedFiles.value).toEqual([]);
	});

	it("should handle file picker error", async () => {
		const { pickFiles, error } = useFilePicker();

		const promise = pickFiles();

		// Simulate error
		const errorCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "error",
		)?.[1];
		errorCallback();

		const result = await promise;

		expect(result.files).toEqual([]);
		expect(result.canceled).toBe(true);
		expect(error.value).toBe("File picker error occurred");
	});

	it("should pick single file", async () => {
		const { pickSingleFile } = useFilePicker();

		const promise = pickSingleFile();

		const changeEvent = { target: { files: [mockFiles[0]] } };
		const changeCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "change",
		)?.[1];
		changeCallback(changeEvent);

		const result = await promise;

		expect(result).toBe(mockFiles[0]);
	});

	it("should return null when no file selected", async () => {
		const { pickSingleFile } = useFilePicker();

		const promise = pickSingleFile();

		const cancelCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "cancel",
		)?.[1];
		cancelCallback();

		const result = await promise;

		expect(result).toBe(null);
	});

	it("should pick multiple files", async () => {
		const { pickMultipleFiles } = useFilePicker({ multiple: true });

		const promise = pickMultipleFiles();

		const changeEvent = { target: { files: mockFiles } };
		const changeCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "change",
		)?.[1];
		changeCallback(changeEvent);

		const result = await promise;

		expect(result).toEqual(mockFiles);
	});

	it("should pick directory", async () => {
		const { pickDirectory } = useFilePicker();

		const promise = pickDirectory();

		const changeEvent = { target: { files: mockFiles } };
		const changeCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "change",
		)?.[1];
		changeCallback(changeEvent);

		const result = await promise;

		expect(result).toEqual(mockFiles);
		expect(mockInput.setAttribute).toHaveBeenCalledWith(
			"webkitdirectory",
			"true",
		);
	});

	it("should pick image", async () => {
		const { pickImage } = useFilePicker();

		const promise = pickImage();

		const changeEvent = { target: { files: [mockFiles[0]] } };
		const changeCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "change",
		)?.[1];
		changeCallback(changeEvent);

		const result = await promise;

		expect(result).toBe(mockFiles[0]);
		expect(mockInput.accept).toBe("image/*");
	});

	it("should pick images", async () => {
		const { pickImages } = useFilePicker();

		const promise = pickImages();

		const changeEvent = {
			target: { files: mockFiles.filter((f) => f.type.startsWith("image/")) },
		};
		const changeCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "change",
		)?.[1];
		changeCallback(changeEvent);

		const result = await promise;

		expect(result).toEqual([mockFiles[0]]);
		expect(mockInput.accept).toBe("image/*");
	});

	it("should pick video", async () => {
		const videoFile = new File(["video"], "video.mp4", { type: "video/mp4" });
		const { pickVideo } = useFilePicker();

		const promise = pickVideo();

		const changeEvent = { target: { files: [videoFile] } };
		const changeCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "change",
		)?.[1];
		changeCallback(changeEvent);

		const result = await promise;

		expect(result).toBe(videoFile);
		expect(mockInput.accept).toBe("video/*");
	});

	it("should pick audio", async () => {
		const { pickAudio } = useFilePicker();

		const promise = pickAudio();

		const changeEvent = { target: { files: [mockFiles[2]] } };
		const changeCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "change",
		)?.[1];
		changeCallback(changeEvent);

		const result = await promise;

		expect(result).toBe(mockFiles[2]);
		expect(mockInput.accept).toBe("audio/*");
	});

	it("should pick document", async () => {
		const { pickDocument } = useFilePicker();

		const promise = pickDocument();

		const changeEvent = { target: { files: [mockFiles[1]] } };
		const changeCallback = mockInput.addEventListener.mock.calls.find(
			(call: any) => call[0] === "change",
		)?.[1];
		changeCallback(changeEvent);

		const result = await promise;

		expect(result).toBe(mockFiles[1]);
		expect(mockInput.accept).toBe(".pdf,.doc,.docx,.txt,.rtf");
	});

	it("should clear files", () => {
		const { selectedFiles, clearFiles, error } = useFilePicker();

		selectedFiles.value = mockFiles;
		error.value = "Some error";

		clearFiles();

		expect(selectedFiles.value).toEqual([]);
		expect(error.value).toBe(null);
	});

	it("should get file extension", () => {
		const { getFileExtension } = useFilePicker();

		expect(getFileExtension(mockFiles[0]!)).toBe("jpg");
		expect(getFileExtension(mockFiles[1]!)).toBe("pdf");
		expect(getFileExtension(mockFiles[2]!)).toBe("mp3");
	});

	it("should get file size", () => {
		const { getFileSize } = useFilePicker();
		const smallFile = new File(["small"], "small.txt", { type: "text/plain" });
		const largeFile = new File(["x".repeat(2048)], "large.txt", {
			type: "text/plain",
		});

		expect(getFileSize(smallFile)).toBe("5 Bytes");
		expect(getFileSize(largeFile)).toBe("2 KB");
	});

	it("should get file type", () => {
		const { getFileType } = useFilePicker();

		expect(getFileType(mockFiles[0]!)).toBe("image");
		expect(getFileType(mockFiles[1]!)).toBe("pdf");
		expect(getFileType(mockFiles[2]!)).toBe("audio");
	});

	it("should validate files", () => {
		const { validateFiles } = useFilePicker();

		const isImage = (file: File) => file.type.startsWith("image/");
		const validFiles = validateFiles(mockFiles, isImage);

		expect(validFiles).toEqual([mockFiles[0]]);
	});

	it("should filter by type", () => {
		const { filterByType } = useFilePicker();

		const images = filterByType(mockFiles, "image");
		expect(images).toEqual([mockFiles[0]]);

		const audios = filterByType(mockFiles, "audio");
		expect(audios).toEqual([mockFiles[2]]);
	});

	it("should filter by extension", () => {
		const { filterByExtension } = useFilePicker();

		const jpgAndPdf = filterByExtension(mockFiles, ["jpg", "pdf"]);
		expect(jpgAndPdf).toEqual([mockFiles[0], mockFiles[1]]);

		const mp3Files = filterByExtension(mockFiles, ["mp3"]);
		expect(mp3Files).toEqual([mockFiles[2]]);
	});

	it("should get total size", () => {
		const { getTotalSize } = useFilePicker();

		const total = getTotalSize(mockFiles);
		const expected = mockFiles.reduce((sum, file) => sum + file.size, 0);
		expect(total).toBe(expected);
	});

	it("should handle case insensitive extensions", () => {
		const { filterByExtension } = useFilePicker();
		const file = new File(["content"], "FILE.JPG", { type: "image/jpeg" });

		const result = filterByExtension([file], ["jpg"]);
		expect(result).toEqual([file]);
	});

	it("should handle files without extensions", () => {
		const { getFileExtension, getFileType } = useFilePicker();
		const file = new File(["content"], "noextension", { type: "text/plain" });

		expect(getFileExtension(file)).toBe("");
		expect(getFileType(file)).toBe("text");
	});
});
