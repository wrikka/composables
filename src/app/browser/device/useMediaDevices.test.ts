import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMediaDevices } from "./useMediaDevices";

// Mock Media Devices API
const mockDevices = [
	{
		deviceId: "audio1",
		groupId: "group1",
		kind: "audioinput",
		label: "Microphone",
	},
	{
		deviceId: "video1",
		groupId: "group1",
		kind: "videoinput",
		label: "Camera",
	},
];

const mockEnumerateDevices = vi.fn().mockResolvedValue(mockDevices);
const mockGetUserMedia = vi.fn().mockResolvedValue({
	getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }, { stop: vi.fn() }]),
});

Object.defineProperty(navigator, "mediaDevices", {
	value: {
		enumerateDevices: mockEnumerateDevices,
		getUserMedia: mockGetUserMedia,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	},
	writable: true,
});

describe("useMediaDevices", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should detect media devices API support", () => {
		const { isSupported } = useMediaDevices();
		expect(isSupported.value).toBe(true);
	});

	it("should enumerate devices", async () => {
		const { devices, audioDevices, videoDevices, enumerateDevices } =
			useMediaDevices();

		await enumerateDevices();

		expect(devices.value).toHaveLength(2);
		expect(audioDevices.value).toHaveLength(1);
		expect(videoDevices.value).toHaveLength(1);
		expect(audioDevices.value[0]?.kind).toBe("audioinput");
		expect(videoDevices.value[0]?.kind).toBe("videoinput");
	});

	it("should request permissions", async () => {
		const { requestPermissions, error } = useMediaDevices();

		const result = await requestPermissions();

		expect(result).toBe(true);
		expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true, video: true });
		expect(error.value).toBe(null);
	});

	it("should request permissions with options", async () => {
		const { requestPermissions } = useMediaDevices({ video: false });

		await requestPermissions();

		expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
	});

	it("should handle permission denial", async () => {
		const testError = new Error("Permission denied");
		mockGetUserMedia.mockRejectedValueOnce(testError);

		const { requestPermissions, error } = useMediaDevices();

		const result = await requestPermissions();

		expect(result).toBe(false);
		expect(error.value).toBe(testError);
	});

	it("should get media stream", async () => {
		const { getStream } = useMediaDevices();

		const stream = await getStream();

		expect(stream).toBeTruthy();
		expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true, video: true });
	});

	it("should get media stream with device ID", async () => {
		const { getStream } = useMediaDevices();

		await getStream("audio1");

		expect(mockGetUserMedia).toHaveBeenCalledWith({
			audio: { deviceId: { exact: "audio1" } },
			video: { deviceId: { exact: "audio1" } },
		});
	});

	it("should handle unsupported API", () => {
		const originalMediaDevices = navigator.mediaDevices;
		delete (navigator as any).mediaDevices;

		const { isSupported, enumerateDevices } = useMediaDevices();

		expect(isSupported.value).toBe(false);

		enumerateDevices().then(() => {
			expect(mockEnumerateDevices).not.toHaveBeenCalled();
		});

		// Restore
		Object.defineProperty(navigator, "mediaDevices", {
			value: originalMediaDevices,
			writable: true,
		});
	});
});
