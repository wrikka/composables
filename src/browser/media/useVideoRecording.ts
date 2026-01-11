import { computed, onUnmounted, ref, watch } from "vue";

export interface VideoRecordingOptions {
	width?: number;
	height?: number;
	frameRate?: number;
	mimeType?: string;
	audioBitsPerSecond?: number;
	videoBitsPerSecond?: number;
	timeSlice?: number;
	autoStop?: boolean;
	maxDuration?: number;
	preview?: boolean;
	showControls?: boolean;
	mirror?: boolean;
}

export interface VideoRecordingState {
	isRecording: boolean;
	isPaused: boolean;
	duration: number;
	startTime: number | null;
	endTime: number | null;
	fileSize: number;
	blob: Blob | null;
	url: string | null;
	error: Error | null;
}

export interface MediaDevices {
	video: MediaDeviceInfo[];
	audio: MediaDeviceInfo[];
}

export interface RecordingStats {
	duration: number;
	fileSize: number;
	bitRate: number;
	resolution: {
		width: number;
		height: number;
	};
	frameRate: number;
}

export function useVideoRecording(options: VideoRecordingOptions = {}) {
	const {
		width = 1280,
		height = 720,
		frameRate = 30,
		mimeType = "video/webm;codecs=vp9",
		audioBitsPerSecond = 128000,
		videoBitsPerSecond = 2500000,
		timeSlice = 1000,
		autoStop = false,
		maxDuration,
		showControls = true,
		mirror = false,
	} = options;

	// State
	const isRecording = ref(false);
	const isPaused = ref(false);
	const duration = ref(0);
	const startTime = ref<number | null>(null);
	const endTime = ref<number | null>(null);
	const fileSize = ref(0);
	const blob = ref<Blob | null>(null);
	const url = ref<string | null>(null);
	const error = ref<Error | null>(null);

	// Media elements
	const stream = ref<MediaStream | null>(null);
	const mediaRecorder = ref<MediaRecorder | null>(null);
	const videoRef = ref<HTMLVideoElement>();
	const previewRef = ref<HTMLVideoElement>();

	// Device management
	const devices = ref<MediaDevices>({ video: [], audio: [] });
	const selectedVideoDevice = ref<string>();
	const selectedAudioDevice = ref<string>();

	// Recording chunks
	const recordedChunks = ref<Blob[]>([]);
	const isDirty = ref(false);
	const durationTimer = ref<NodeJS.Timeout>();

	// Computed properties
	const state = computed<VideoRecordingState>(() => ({
		isRecording: isRecording.value,
		isPaused: isPaused.value,
		duration: duration.value,
		startTime: startTime.value,
		endTime: endTime.value,
		fileSize: fileSize.value,
		blob: blob.value,
		url: url.value,
		error: error.value,
		isDirty: isDirty.value,
	}));

	const canRecord = computed(() => {
		return !isRecording.value && stream.value !== null;
	});

	const canPause = computed(() => {
		return isRecording.value && !isPaused.value;
	});

	const canResume = computed(() => {
		return isRecording.value && isPaused.value;
	});

	const canStop = computed(() => {
		return isRecording.value;
	});

	const stats = computed<RecordingStats>(() => {
		const bitRate =
			duration.value > 0 ? (fileSize.value * 8) / duration.value : 0;
		return {
			duration: duration.value,
			fileSize: fileSize.value,
			bitRate,
			resolution: { width, height },
			frameRate,
		};
	});

	const formattedDuration = computed(() => {
		const seconds = Math.floor(duration.value / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		const remainingMinutes = minutes % 60;
		const remainingSeconds = seconds % 60;

		if (hours > 0) {
			return `${hours}:${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
		}

		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	});

	const formattedFileSize = computed(() => {
		if (fileSize.value === 0) return "0 B";

		const units = ["B", "KB", "MB", "GB"];
		let size = fileSize.value;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(1)} ${units[unitIndex]}`;
	});

	// Methods
	async function getDevices() {
		try {
			const allDevices = await navigator.mediaDevices.enumerateDevices();

			devices.value = {
				video: allDevices.filter((device) => device.kind === "videoinput"),
				audio: allDevices.filter((device) => device.kind === "audioinput"),
			};

			// Auto-select first devices if not selected
			if (!selectedVideoDevice.value && devices.value.video.length > 0) {
				selectedVideoDevice.value = devices.value.video[0]?.deviceId;
			}

			if (!selectedAudioDevice.value && devices.value.audio.length > 0) {
				selectedAudioDevice.value = devices.value.audio[0]?.deviceId;
			}
		} catch (err) {
			error.value = err as Error;
			console.error("Failed to get devices:", err);
		}
	}

	async function startStream() {
		try {
			stopStream();

			const constraints: MediaStreamConstraints = {
				video: selectedVideoDevice.value
					? {
							deviceId: selectedVideoDevice.value,
							width,
							height,
							frameRate,
						}
					: {
							width,
							height,
							frameRate,
						},
				audio: selectedAudioDevice.value
					? { deviceId: selectedAudioDevice.value }
					: true,
			};

			stream.value = await navigator.mediaDevices.getUserMedia(constraints);

			// Set up preview
			if (previewRef.value) {
				previewRef.value.srcObject = stream.value;
				previewRef.value.muted = true;
				previewRef.value.play();
			}

			error.value = null;
		} catch (err) {
			error.value = err as Error;
			console.error("Failed to start stream:", err);
		}
	}

	function stopStream() {
		if (stream.value) {
			stream.value.getTracks().forEach((track) => track.stop());
			stream.value = null;
		}

		if (previewRef.value) {
			previewRef.value.srcObject = null;
		}
	}

	async function startRecording() {
		if (!stream.value) {
			error.value = new Error("No active stream. Call startStream() first.");
			return;
		}

		try {
			// Reset recording state
			recordedChunks.value = [];
			duration.value = 0;
			startTime.value = Date.now();
			endTime.value = null;
			blob.value = null;
			url.value = null;
			fileSize.value = 0;
			error.value = null;

			// Create MediaRecorder
			const options: MediaRecorderOptions = {
				mimeType,
				audioBitsPerSecond,
				videoBitsPerSecond,
			};

			mediaRecorder.value = new MediaRecorder(stream.value, options);

			// Set up event handlers
			mediaRecorder.value.ondataavailable = (event) => {
				if (event.data.size > 0) {
					recordedChunks.value.push(event.data);
					fileSize.value += event.data.size;
				}
			};

			mediaRecorder.value.onstop = handleRecordingStop;
			mediaRecorder.value.onerror = (event) => {
				error.value = new Error(`Recording error: ${(event as any).error}`);
				stopRecording();
			};

			// Start recording
			mediaRecorder.value.start(timeSlice);
			isRecording.value = true;
			isPaused.value = false;

			// Start duration timer
			startDurationTimer();

			// Auto-stop if max duration is set
			if (autoStop && maxDuration) {
				setTimeout(() => {
					if (isRecording.value) {
						stopRecording();
					}
				}, maxDuration);
			}
		} catch (err) {
			error.value = err as Error;
			console.error("Failed to start recording:", err);
		}
	}

	function pauseRecording() {
		if (mediaRecorder.value && isRecording.value && !isPaused.value) {
			mediaRecorder.value.pause();
			isPaused.value = true;
			stopDurationTimer();
		}
	}

	function resumeRecording() {
		if (mediaRecorder.value && isRecording.value && isPaused.value) {
			mediaRecorder.value.resume();
			isPaused.value = false;
			startDurationTimer();
		}
	}

	function stopRecording() {
		if (mediaRecorder.value && isRecording.value) {
			mediaRecorder.value.stop();
			isRecording.value = false;
			isPaused.value = false;
			stopDurationTimer();

			if (startTime.value) {
				endTime.value = Date.now();
				duration.value = endTime.value - startTime.value;
			}
		}
	}

	function handleRecordingStop() {
		// Create blob from recorded chunks
		blob.value = new Blob(recordedChunks.value, { type: mimeType });
		url.value = URL.createObjectURL(blob.value);

		// Set up video element for playback
		if (videoRef.value) {
			videoRef.value.src = url.value;
			videoRef.value.controls = showControls;
		}
	}

	function startDurationTimer() {
		stopDurationTimer();

		if (startTime.value) {
			durationTimer.value = setInterval(() => {
				duration.value = Date.now() - startTime.value!;
			}, 100);
		}
	}

	function stopDurationTimer() {
		if (durationTimer.value) {
			clearInterval(durationTimer.value);
			durationTimer.value = undefined;
		}
	}

	function downloadRecording(filename = `recording-${Date.now()}.webm`) {
		if (url.value) {
			const a = document.createElement("a");
			a.href = url.value;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	}

	function clearRecording() {
		// Revoke URL to free memory
		if (url.value) {
			URL.revokeObjectURL(url.value);
		}

		// Reset state
		blob.value = null;
		url.value = null;
		recordedChunks.value = [];
		fileSize.value = 0;
		duration.value = 0;
		startTime.value = null;
		endTime.value = null;

		// Clear video element
		if (videoRef.value) {
			videoRef.value.src = "";
		}
	}

	async function switchVideoDevice(deviceId: string) {
		selectedVideoDevice.value = deviceId;
		if (stream.value) {
			await startStream();
		}
	}

	async function switchAudioDevice(deviceId: string) {
		selectedAudioDevice.value = deviceId;
		if (stream.value) {
			await startStream();
		}
	}

	function toggleMirror() {
		if (previewRef.value) {
			previewRef.value.style.transform = mirror ? "scaleX(-1)" : "scaleX(1)";
		}
	}

	// Watch for device selection changes
	watch([selectedVideoDevice, selectedAudioDevice], async () => {
		if (stream.value) {
			await startStream();
		}
	});

	// Initialize
	getDevices();

	// Cleanup
	onUnmounted(() => {
		stopRecording();
		stopStream();
		clearRecording();
	});

	return {
		// State
		state,
		isRecording,
		isPaused,
		duration,
		blob,
		url,
		error,
		fileSize,
		isDirty,
		startTime,
		endTime,
		recordedChunks,

		// Computed
		canRecord,
		canPause,
		canResume,
		canStop,
		stats,
		formattedDuration,
		formattedFileSize,

		// Devices
		devices,
		selectedVideoDevice,
		selectedAudioDevice,

		// Refs
		videoRef,
		previewRef,

		// Methods
		getDevices,
		startStream,
		stopStream,
		startRecording,
		pauseRecording,
		resumeRecording,
		stopRecording,
		downloadRecording,
		clearRecording,
		switchVideoDevice,
		switchAudioDevice,
		toggleMirror,
	};
}
