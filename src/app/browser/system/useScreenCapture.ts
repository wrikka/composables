import { ref } from "vue";

export interface ScreenCaptureOptions {
	onSuccess?: (stream: MediaStream) => void;
	onError?: (error: Error) => void;
	onStop?: () => void;
}

export function useScreenCapture(options: ScreenCaptureOptions = {}) {
	const isSupported = ref("getDisplayMedia" in navigator.mediaDevices);
	const isCapturing = ref(false);
	const stream = ref<MediaStream | null>(null);
	const error = ref<Error | null>(null);

	const startCapture = async (
		displayMediaOptions?: DisplayMediaStreamOptions,
	): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = new Error("Screen capture not supported");
			options.onError?.(error.value);
			return false;
		}

		if (isCapturing.value) return false;

		error.value = null;

		try {
			const mediaStream = await navigator.mediaDevices.getDisplayMedia(
				displayMediaOptions || {
					video: true,
					audio: false,
				},
			);

			stream.value = mediaStream;
			isCapturing.value = true;

			// Listen for stream end
			mediaStream.getVideoTracks().forEach((track) => {
				track.addEventListener("ended", stopCapture);
			});

			options.onSuccess?.(mediaStream);
			return true;
		} catch (err) {
			error.value = err as Error;
			options.onError?.(err as Error);
			return false;
		}
	};

	const stopCapture = (): void => {
		if (stream.value) {
			stream.value.getTracks().forEach((track) => {
				track.stop();
			});
			stream.value = null;
		}
		isCapturing.value = false;
		options.onStop?.();
	};

	const captureFrame = (): string | null => {
		if (!stream.value) return null;

		const video = document.createElement("video");
		video.srcObject = stream.value;
		video.play();

		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");

		if (!context) return null;

		return new Promise((resolve) => {
			video.addEventListener("loadedmetadata", () => {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				context.drawImage(video, 0, 0);
				resolve(canvas.toDataURL("image/png"));
			});
		}) as any;
	};

	const toggleCapture = async (
		options?: DisplayMediaStreamOptions,
	): Promise<boolean> => {
		if (isCapturing.value) {
			stopCapture();
			return false;
		} else {
			return await startCapture(options);
		}
	};

	const getAudioTracks = (): MediaStreamTrack[] => {
		if (!stream.value) return [];
		return stream.value.getAudioTracks();
	};

	const getVideoTracks = (): MediaStreamTrack[] => {
		if (!stream.value) return [];
		return stream.value.getVideoTracks();
	};

	const isAudioEnabled = (): boolean => {
		return getAudioTracks().some((track) => track.enabled);
	};

	const isVideoEnabled = (): boolean => {
		return getVideoTracks().some((track) => track.enabled);
	};

	const enableAudio = (enabled: boolean): void => {
		getAudioTracks().forEach((track) => {
			track.enabled = enabled;
		});
	};

	const enableVideo = (enabled: boolean): void => {
		getVideoTracks().forEach((track) => {
			track.enabled = enabled;
		});
	};

	// Cleanup on component unmount
	const cleanup = (): void => {
		stopCapture();
	};

	return {
		isSupported,
		isCapturing,
		stream,
		error,
		startCapture,
		stopCapture,
		toggleCapture,
		captureFrame,
		getAudioTracks,
		getVideoTracks,
		isAudioEnabled,
		isVideoEnabled,
		enableAudio,
		enableVideo,
		cleanup,
	};
}
