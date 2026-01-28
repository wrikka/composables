import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAudioRecording } from "./useAudioRecording";

const mockMediaRecorder = {
	start: vi.fn(),
	stop: vi.fn(),
	pause: vi.fn(),
	resume: vi.fn(),
	ondataavailable: null as any,
};

const mockStream = {
	getTracks: vi.fn(() => []),
	getAudioTracks: vi.fn(() => []),
};

const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);

Object.defineProperty(navigator, "mediaDevices", {
	value: {
		getUserMedia: mockGetUserMedia,
	},
	writable: true,
});

global.MediaRecorder = class {
	constructor(stream: any, options: any) {
		return mockMediaRecorder;
	}
	static isTypeSupported(mimeType: string) {
		return mimeType === "audio/webm";
	}
} as any;

describe("useAudioRecording", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockMediaRecorder.start.mockClear();
		mockMediaRecorder.stop.mockClear();
	});

	it("should initialize with default values", () => {
		const { isSupported, isRecording, stream, chunks, error } = useAudioRecording();

		expect(isSupported.value).toBe(true);
		expect(isRecording.value).toBe(false);
		expect(stream.value).toBeNull();
		expect(chunks.value).toEqual([]);
		expect(error.value).toBeNull();
	});

	it("should start recording successfully", async () => {
		const { start, isRecording, stream } = useAudioRecording();

		const result = await start();

		expect(result).toBe(true);
		expect(isRecording.value).toBe(true);
		expect(stream.value).not.toBeNull();
		expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
	});

	it("should handle start error", async () => {
		const mockError = new Error("Permission denied");
		mockGetUserMedia.mockRejectedValue(mockError);

		const { start, error } = useAudioRecording();

		const result = await start();

		expect(result).toBe(false);
		expect(error.value).toBe(mockError);
	});

	it("should stop recording and return blob", async () => {
		const { start, stop, isRecording } = useAudioRecording();

		await start();
		const blob = await stop();

		expect(blob).toBeInstanceOf(Blob);
		expect(isRecording.value).toBe(false);
	});

	it("should pause recording", () => {
		const { pause } = useAudioRecording();

		pause();

		expect(pause).toBeDefined();
	});

	it("should resume recording", () => {
		const { resume } = useAudioRecording();

		resume();

		expect(resume).toBeDefined();
	});

	it("should handle unsupported browsers", () => {
		delete (window as any).MediaRecorder;

		const { isSupported } = useAudioRecording();

		expect(isSupported.value).toBe(false);

		global.MediaRecorder = class {
			constructor(stream: any, options: any) {
				return mockMediaRecorder;
			}
			static isTypeSupported(mimeType: string) {
				return mimeType === "audio/webm";
			}
		} as any;
	});

	it("should accept custom options", async () => {
		const { start } = useAudioRecording({
			mimeType: "audio/webm",
			audioBitsPerSecond: 128000,
		});

		await start();

		expect(mockGetUserMedia).toHaveBeenCalled();
	});

	it("should provide chunks array", () => {
		const { chunks } = useAudioRecording();

		expect(Array.isArray(chunks.value)).toBe(true);
	});
});
