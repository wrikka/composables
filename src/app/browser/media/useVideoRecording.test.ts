import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVideoRecording } from "./useVideoRecording";

// Mock MediaDevices and MediaRecorder
const mockGetUserMedia = vi.fn();
const mockEnumerateDevices = vi.fn();
const mockMediaRecorder = vi.fn();

Object.defineProperty(navigator, "mediaDevices", {
	value: {
		getUserMedia: mockGetUserMedia,
		enumerateDevices: mockEnumerateDevices,
	},
	writable: true,
});

Object.defineProperty(window, "MediaRecorder", {
	value: mockMediaRecorder,
	writable: true,
});

describe("useVideoRecording", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Mock device enumeration
		mockEnumerateDevices.mockResolvedValue([
			{
				deviceId: "camera1",
				kind: "videoinput",
				label: "Camera 1",
			},
			{
				deviceId: "mic1",
				kind: "audioinput",
				label: "Microphone 1",
			},
		]);

		// Mock getUserMedia
		const mockStream = {
			getTracks: vi.fn(() => [{ stop: vi.fn() }, { stop: vi.fn() }]),
		};
		mockGetUserMedia.mockResolvedValue(mockStream);

		// Mock MediaRecorder
		const mockRecorderInstance = {
			start: vi.fn(),
			stop: vi.fn(),
			pause: vi.fn(),
			resume: vi.fn(),
			ondataavailable: null,
			onstop: null,
			onerror: null,
		};
		mockMediaRecorder.mockImplementation(() => mockRecorderInstance);
	});

	it("should initialize with default options", () => {
		const recorder = useVideoRecording();

		expect(recorder.isRecording.value).toBe(false);
		expect(recorder.isPaused.value).toBe(false);
		expect(recorder.duration.value).toBe(0);
		expect(recorder.blob.value).toBe(null);
		expect(recorder.url.value).toBe(null);
		expect(recorder.error.value).toBe(null);
	});

	it("should initialize with custom options", () => {
		const recorder = useVideoRecording({
			width: 1920,
			height: 1080,
			frameRate: 60,
			mimeType: "video/mp4",
			preview: false,
			mirror: true,
		});

		expect(recorder.state.value).toEqual({
			isRecording: false,
			isPaused: false,
			duration: 0,
			startTime: null,
			endTime: null,
			fileSize: 0,
			blob: null,
			url: null,
			error: null,
		});
	});

	it("should get available devices", async () => {
		const recorder = useVideoRecording();

		await recorder.getDevices();

		expect(mockEnumerateDevices).toHaveBeenCalled();
		expect(recorder.devices.value.video).toHaveLength(1);
		expect(recorder.devices.value.audio).toHaveLength(1);
		expect(recorder.selectedVideoDevice.value).toBe("camera1");
		expect(recorder.selectedAudioDevice.value).toBe("mic1");
	});

	it("should start stream", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();

		await recorder.startStream();

		expect(mockGetUserMedia).toHaveBeenCalledWith({
			video: {
				deviceId: "camera1",
				width: 1280,
				height: 720,
				frameRate: 30,
			},
			audio: {
				deviceId: "mic1",
			},
		});
		expect(recorder.error.value).toBe(null);
	});

	it("should stop stream", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();

		recorder.stopStream();

		const mockStream = mockGetUserMedia.mock.results[0]?.value;
		expect(mockStream?.getTracks).toHaveBeenCalled();
	});

	it("should handle stream start error", async () => {
		const recorder = useVideoRecording();

		const error = new Error("Permission denied");
		mockGetUserMedia.mockRejectedValue(error);

		await recorder.startStream();

		expect(recorder.error.value).toBe(error);
	});

	it("should start recording", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();

		await recorder.startRecording();

		expect(mockMediaRecorder).toHaveBeenCalled();
		expect(recorder.isRecording.value).toBe(true);
		expect(recorder.isPaused.value).toBe(false);
		expect(recorder.startTime.value).not.toBe(null);
	});

	it("should not start recording without stream", async () => {
		const recorder = useVideoRecording();

		await recorder.startRecording();

		expect(recorder.error.value?.message).toBe(
			"No active stream. Call startStream() first.",
		);
		expect(recorder.isRecording.value).toBe(false);
	});

	it("should pause recording", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();
		await recorder.startRecording();

		recorder.pauseRecording();

		const mockRecorder = mockMediaRecorder.mock.results[0]?.value;
		expect(mockRecorder?.pause).toHaveBeenCalled();
		expect(recorder.isPaused.value).toBe(true);
	});

	it("should resume recording", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();
		await recorder.startRecording();

		recorder.pauseRecording();
		recorder.resumeRecording();

		const mockRecorder = mockMediaRecorder.mock.results[0]?.value;
		expect(mockRecorder?.resume).toHaveBeenCalled();
		expect(recorder.isPaused.value).toBe(false);
	});

	it("should stop recording", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();
		await recorder.startRecording();

		recorder.stopRecording();

		const mockRecorder = mockMediaRecorder.mock.results[0]?.value;
		expect(mockRecorder?.stop).toHaveBeenCalled();
		expect(recorder.isRecording.value).toBe(false);
		expect(recorder.isPaused.value).toBe(false);
		expect(recorder.endTime.value).not.toBe(null);
	});

	it("should handle recording data", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();
		await recorder.startRecording();

		const mockRecorder = mockMediaRecorder.mock.results[0]?.value;
		const mockData = new Blob(["test"], { type: "video/webm" });

		if (mockRecorder?.ondataavailable) {
			mockRecorder.ondataavailable({ data: mockData });
		}

		expect(recorder.recordedChunks.value).toContain(mockData);
		expect(recorder.fileSize.value).toBe(mockData.size);
	});

	it("should handle recording stop", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();
		await recorder.startRecording();

		const mockRecorder = mockMediaRecorder.mock.results[0]?.value;
		const mockData = new Blob(["test"], { type: "video/webm" });

		// Add some data
		if (mockRecorder?.ondataavailable) {
			mockRecorder.ondataavailable({ data: mockData });
		}

		// Stop recording
		recorder.stopRecording();

		// Simulate stop event
		if (mockRecorder.onstop) {
			mockRecorder.onstop();
		}

		expect(recorder.blob.value).toBeInstanceOf(Blob);
		expect(recorder.url.value).toBeTruthy();
	});

	it("should clear recording", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();
		await recorder.startRecording();

		// Simulate recording completion
		recorder.stopRecording();
		const mockRecorder = mockMediaRecorder.mock.results[0]?.value;
		if (mockRecorder?.onstop) {
			mockRecorder.onstop();
		}

		expect(recorder.blob.value).toBeTruthy();
		expect(recorder.url.value).toBeTruthy();

		recorder.clearRecording();

		expect(recorder.blob.value).toBe(null);
		expect(recorder.url.value).toBe(null);
		expect(recorder.recordedChunks.value).toHaveLength(0);
	});

	it("should switch video device", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();

		// Add another device
		mockEnumerateDevices.mockResolvedValue([
			{ deviceId: "camera1", kind: "videoinput", label: "Camera 1" },
			{ deviceId: "camera2", kind: "videoinput", label: "Camera 2" },
			{ deviceId: "mic1", kind: "audioinput", label: "Microphone 1" },
		]);

		await recorder.switchVideoDevice("camera2");

		expect(recorder.selectedVideoDevice.value).toBe("camera2");
		expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
	});

	it("should switch audio device", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();

		// Add another device
		mockEnumerateDevices.mockResolvedValue([
			{ deviceId: "camera1", kind: "videoinput", label: "Camera 1" },
			{ deviceId: "mic1", kind: "audioinput", label: "Microphone 1" },
			{ deviceId: "mic2", kind: "audioinput", label: "Microphone 2" },
		]);

		await recorder.switchAudioDevice("mic2");

		expect(recorder.selectedAudioDevice.value).toBe("mic2");
		expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
	});

	it("should calculate stats correctly", async () => {
		const recorder = useVideoRecording({
			width: 1920,
			height: 1080,
			frameRate: 60,
		});

		// Simulate some recording data
		recorder.fileSize.value = 1000000; // 1MB
		recorder.duration.value = 10000; // 10 seconds

		expect(recorder.stats.value).toEqual({
			duration: 10000,
			fileSize: 1000000,
			bitRate: 800, // 1MB * 8 / 10s
			resolution: { width: 1920, height: 1080 },
			frameRate: 60,
		});
	});

	it("should format duration correctly", () => {
		const recorder = useVideoRecording();

		recorder.duration.value = 5000; // 5 seconds
		expect(recorder.formattedDuration.value).toBe("0:05");

		recorder.duration.value = 65000; // 1 minute 5 seconds
		expect(recorder.formattedDuration.value).toBe("1:05");

		recorder.duration.value = 3665000; // 1 hour 1 minute 5 seconds
		expect(recorder.formattedDuration.value).toBe("1:01:05");
	});

	it("should format file size correctly", () => {
		const recorder = useVideoRecording();

		recorder.fileSize.value = 0;
		expect(recorder.formattedFileSize.value).toBe("0 B");

		recorder.fileSize.value = 1024;
		expect(recorder.formattedFileSize.value).toBe("1.0 KB");

		recorder.fileSize.value = 1024 * 1024;
		expect(recorder.formattedFileSize.value).toBe("1.0 MB");

		recorder.fileSize.value = 1024 * 1024 * 1024;
		expect(recorder.formattedFileSize.value).toBe("1.0 GB");
	});

	it("should compute can states correctly", () => {
		const recorder = useVideoRecording();

		// Initially can't record without stream
		expect(recorder.canRecord.value).toBe(false);
		expect(recorder.canPause.value).toBe(false);
		expect(recorder.canResume.value).toBe(false);
		expect(recorder.canStop.value).toBe(false);
	});

	it("should download recording", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();
		await recorder.startRecording();

		// Simulate recording completion
		recorder.stopRecording();
		const mockRecorder = mockMediaRecorder.mock.results[0]?.value;
		if (mockRecorder?.onstop) {
			mockRecorder.onstop();
		}

		// Mock DOM methods
		const mockCreateElement = vi.spyOn(document, "createElement");
		const mockAppendChild = vi.spyOn(document.body, "appendChild");
		const mockRemoveChild = vi.spyOn(document.body, "removeChild");

		recorder.downloadRecording("test-video.webm");

		expect(mockCreateElement).toHaveBeenCalledWith("a");
		expect(mockAppendChild).toHaveBeenCalled();
		expect(mockRemoveChild).toHaveBeenCalled();
	});

	it("should handle recorder error", async () => {
		const recorder = useVideoRecording();
		await recorder.getDevices();
		await recorder.startStream();
		await recorder.startRecording();

		const mockRecorder = mockMediaRecorder.mock.results[0]?.value;
		const error = new Error("Recorder failed");

		if (mockRecorder?.onerror) {
			mockRecorder.onerror({ error });
		}

		expect(recorder.error.value?.message).toContain("Recording error");
	});
});
