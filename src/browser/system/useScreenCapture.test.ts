import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScreenCapture } from "./useScreenCapture";

// Mock MediaDevices and MediaStream
const mockGetDisplayMedia = vi.fn();
const mockStream = {
	getTracks: vi.fn().mockReturnValue([
		{
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			stop: vi.fn(),
			enabled: true,
		},
	]),
	getAudioTracks: vi.fn().mockReturnValue([]),
	getVideoTracks: vi.fn().mockReturnValue([
		{
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			stop: vi.fn(),
			enabled: true,
		},
	]),
};

Object.defineProperty(navigator, "mediaDevices", {
	value: {
		getDisplayMedia: mockGetDisplayMedia,
	},
	writable: true,
});

// Mock DOM elements
const mockVideo = {
	srcObject: null,
	play: vi.fn().mockResolvedValue(undefined),
	videoWidth: 1920,
	videoHeight: 1080,
	addEventListener: vi.fn(),
};

const mockCanvas = {
	width: 0,
	height: 0,
	getContext: vi.fn().mockReturnValue({
		drawImage: vi.fn(),
	}),
	toDataURL: vi.fn().mockReturnValue("data:image/png;base64,test"),
};

Object.defineProperty(document, "createElement", {
	value: vi.fn((tagName) => {
		if (tagName === "video") return mockVideo;
		if (tagName === "canvas") return mockCanvas;
		return {};
	}),
	writable: true,
});

describe("useScreenCapture", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetDisplayMedia.mockResolvedValue(mockStream);
	});

	it("should detect screen capture support", () => {
		const { isSupported } = useScreenCapture();
		expect(isSupported.value).toBe(true);
	});

	it("should start capture successfully", async () => {
		const onSuccess = vi.fn();
		const { startCapture, isCapturing, stream, error } = useScreenCapture({
			onSuccess,
		});

		const result = await startCapture();

		expect(result).toBe(true);
		expect(isCapturing.value).toBe(true);
		expect(stream.value).toBe(mockStream);
		expect(error.value).toBe(null);
		expect(mockGetDisplayMedia).toHaveBeenCalledWith({
			video: true,
			audio: false,
		});
		expect(onSuccess).toHaveBeenCalledWith(mockStream);
	});

	it("should start capture with custom options", async () => {
		const { startCapture } = useScreenCapture();

		const options = { video: true, audio: true };
		await startCapture(options);

		expect(mockGetDisplayMedia).toHaveBeenCalledWith(options);
	});

	it("should handle capture error", async () => {
		const onError = vi.fn();
		const testError = new Error("Permission denied");
		mockGetDisplayMedia.mockRejectedValue(testError);

		const { startCapture, isCapturing, error } = useScreenCapture({ onError });

		const result = await startCapture();

		expect(result).toBe(false);
		expect(isCapturing.value).toBe(false);
		expect(error.value).toBe(testError);
		expect(onError).toHaveBeenCalledWith(testError);
	});

	it("should stop capture", () => {
		const onStop = vi.fn();
		const { startCapture, stopCapture, isCapturing, stream } = useScreenCapture(
			{ onStop },
		);

		// Start capture first
		startCapture();

		stopCapture();

		expect(isCapturing.value).toBe(false);
		expect(stream.value).toBe(null);
		expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
		expect(onStop).toHaveBeenCalled();
	});

	it("should toggle capture", async () => {
		const { toggleCapture, isCapturing } = useScreenCapture();

		// Start capture
		const result1 = await toggleCapture();
		expect(result1).toBe(true);
		expect(isCapturing.value).toBe(true);

		// Stop capture
		const result2 = await toggleCapture();
		expect(result2).toBe(false);
		expect(isCapturing.value).toBe(false);
	});

	it("should get audio and video tracks", () => {
		const { startCapture, getAudioTracks, getVideoTracks } = useScreenCapture();

		startCapture();

		expect(getAudioTracks()).toEqual([]);
		expect(getVideoTracks()).toHaveLength(1);
	});

	it("should check if audio/video is enabled", () => {
		const { startCapture, isAudioEnabled, isVideoEnabled } = useScreenCapture();

		startCapture();

		expect(isAudioEnabled()).toBe(false);
		expect(isVideoEnabled()).toBe(true);
	});

	it("should enable/disable audio", () => {
		const audioTrack = { enabled: true };
		mockStream.getAudioTracks = vi.fn().mockReturnValue([audioTrack]);

		const { startCapture, enableAudio } = useScreenCapture();

		startCapture();

		enableAudio(false);
		expect(audioTrack.enabled).toBe(false);

		enableAudio(true);
		expect(audioTrack.enabled).toBe(true);
	});

	it("should enable/disable video", () => {
		const { startCapture, enableVideo } = useScreenCapture();

		startCapture();

		enableVideo(false);
		expect(mockStream.getVideoTracks()[0].enabled).toBe(false);

		enableVideo(true);
		expect(mockStream.getVideoTracks()[0].enabled).toBe(true);
	});

	it("should capture frame", async () => {
		const { startCapture, captureFrame } = useScreenCapture();

		await startCapture();

		mockVideo.addEventListener.mock.calls.find(
			([event]) => event === "loadedmetadata",
		)?.[1]();

		const frame = await captureFrame();

		expect(frame).toBe("data:image/png;base64,test");
		expect(mockCanvas.width).toBe(1920);
		expect(mockCanvas.height).toBe(1080);
	});

	it("should handle unsupported API", async () => {
		delete (navigator.mediaDevices as any).getDisplayMedia;

		const { isSupported, startCapture } = useScreenCapture();

		expect(isSupported.value).toBe(false);

		const result = await startCapture();
		expect(result).toBe(false);

		// Restore
		Object.defineProperty(navigator.mediaDevices, "getDisplayMedia", {
			value: mockGetDisplayMedia,
			writable: true,
		});
	});

	it("should prevent concurrent captures", async () => {
		const { startCapture } = useScreenCapture();

		// Start first capture
		const promise1 = startCapture();

		// Try second capture while first is active
		const promise2 = startCapture();

		expect(await promise1).toBe(true);
		expect(await promise2).toBe(false);
	});
});
