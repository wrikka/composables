import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMediaStream } from "./useMediaStream";

const mockTrack = {
	stop: vi.fn(),
	enabled: true,
};

const mockStream = {
	getTracks: vi.fn(() => [mockTrack]),
	getVideoTracks: vi.fn(() => [mockTrack]),
	getAudioTracks: vi.fn(() => [mockTrack]),
};

const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);

Object.defineProperty(navigator, "mediaDevices", {
	value: {
		getUserMedia: mockGetUserMedia,
	},
	writable: true,
});

describe("useMediaStream", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUserMedia.mockClear();
	});

	it("should initialize with default values", () => {
		const { isSupported, stream, isActive, error } = useMediaStream();

		expect(isSupported.value).toBe(true);
		expect(stream.value).toBeNull();
		expect(isActive.value).toBe(false);
		expect(error.value).toBeNull();
	});

	it("should start stream with audio", async () => {
		const { start, stream, isActive } = useMediaStream({ audio: true });

		const result = await start();

		expect(result).toBe(true);
		expect(isActive.value).toBe(true);
		expect(stream.value).not.toBeNull();
		expect(mockGetUserMedia).toHaveBeenCalledWith({ video: false, audio: true });
	});

	it("should start stream with video", async () => {
		const { start, stream, isActive } = useMediaStream({ video: true });

		const result = await start();

		expect(result).toBe(true);
		expect(isActive.value).toBe(true);
		expect(stream.value).not.toBeNull();
		expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true, audio: false });
	});

	it("should start stream with both audio and video", async () => {
		const { start, stream, isActive } = useMediaStream({
			audio: true,
			video: true,
		});

		const result = await start();

		expect(result).toBe(true);
		expect(isActive.value).toBe(true);
		expect(stream.value).not.toBeNull();
		expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true, audio: true });
	});

	it("should handle start error", async () => {
		const mockError = new Error("Permission denied");
		mockGetUserMedia.mockRejectedValue(mockError);

		const { start, error } = useMediaStream({ audio: true });

		const result = await start();

		expect(result).toBe(false);
		expect(error.value).toBe(mockError);
	});

	it("should stop stream", async () => {
		const { start, stop, stream, isActive } = useMediaStream({ audio: true });

		await start();
		stop();

		expect(stream.value).toBeNull();
		expect(isActive.value).toBe(false);
		expect(mockTrack.stop).toHaveBeenCalled();
	});

	it("should get all tracks", async () => {
		const { start, getTracks } = useMediaStream({ audio: true });

		await start();
		const tracks = getTracks();

		expect(Array.isArray(tracks)).toBe(true);
	});

	it("should get video tracks", async () => {
		const { start, getVideoTracks } = useMediaStream({ video: true });

		await start();
		const tracks = getVideoTracks();

		expect(Array.isArray(tracks)).toBe(true);
	});

	it("should get audio tracks", async () => {
		const { start, getAudioTracks } = useMediaStream({ audio: true });

		await start();
		const tracks = getAudioTracks();

		expect(Array.isArray(tracks)).toBe(true);
	});

	it("should handle unsupported browsers", () => {
		delete (navigator as any).mediaDevices;

		const { isSupported } = useMediaStream();

		expect(isSupported.value).toBe(false);

		Object.defineProperty(navigator, "mediaDevices", {
			value: {
				getUserMedia: mockGetUserMedia,
			},
			writable: true,
		});
	});

	it("should accept custom constraints", async () => {
		const { start } = useMediaStream({
			video: { width: 1280, height: 720 },
			audio: { echoCancellation: true },
		});

		await start();

		expect(mockGetUserMedia).toHaveBeenCalledWith({
			video: { width: 1280, height: 720 },
			audio: { echoCancellation: true },
		});
	});
});
