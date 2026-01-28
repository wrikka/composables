import { onMounted, onUnmounted, ref } from "vue";

export interface MediaDevice {
	deviceId: string;
	groupId: string;
	kind: MediaDeviceKind;
	label: string;
}

export interface MediaDevicesOptions {
	audio?: boolean;
	video?: boolean;
}

export function useMediaDevices(options: MediaDevicesOptions = {}) {
	const isSupported = ref("mediaDevices" in navigator);
	const devices = ref<MediaDevice[]>([]);
	const audioDevices = ref<MediaDevice[]>([]);
	const videoDevices = ref<MediaDevice[]>([]);
	const isLoading = ref(false);
	const error = ref<Error | null>(null);

	const filterDevices = () => {
		audioDevices.value = devices.value.filter(
			(device) => device.kind === "audioinput",
		);
		videoDevices.value = devices.value.filter(
			(device) => device.kind === "videoinput",
		);
	};

	const enumerateDevices = async (): Promise<MediaDevice[]> => {
		if (!isSupported.value) {
			error.value = new Error("Media Devices API not supported");
			return [];
		}

		isLoading.value = true;
		error.value = null;

		try {
			const deviceList = await navigator.mediaDevices.enumerateDevices();
			devices.value = deviceList.map((device) => ({
				deviceId: device.deviceId,
				groupId: device.groupId,
				kind: device.kind,
				label: device.label,
			}));

			filterDevices();
			return devices.value;
		} catch (err) {
			error.value = err as Error;
			return [];
		} finally {
			isLoading.value = false;
		}
	};

	const requestPermissions = async (): Promise<boolean> => {
		if (!isSupported.value) return false;

		try {
			const constraints: MediaStreamConstraints = {};
			if (options.audio !== false) constraints.audio = true;
			if (options.video !== false) constraints.video = true;

			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			stream.getTracks().forEach((track) => track.stop());

			await enumerateDevices();
			return true;
		} catch (err) {
			error.value = err as Error;
			return false;
		}
	};

	const getStream = async (deviceId?: string): Promise<MediaStream | null> => {
		if (!isSupported.value) return null;

		try {
			const constraints: MediaStreamConstraints = {};

			if (options.audio !== false) {
				constraints.audio = deviceId ? { deviceId: { exact: deviceId } } : true;
			}

			if (options.video !== false) {
				constraints.video = deviceId ? { deviceId: { exact: deviceId } } : true;
			}

			return await navigator.mediaDevices.getUserMedia(constraints);
		} catch (err) {
			error.value = err as Error;
			return null;
		}
	};

	const handleDeviceChange = () => {
		enumerateDevices();
	};

	onMounted(() => {
		if (isSupported.value) {
			navigator.mediaDevices.addEventListener(
				"devicechange",
				handleDeviceChange,
			);
			enumerateDevices();
		}
	});

	onUnmounted(() => {
		if (isSupported.value) {
			navigator.mediaDevices.removeEventListener(
				"devicechange",
				handleDeviceChange,
			);
		}
	});

	return {
		isSupported,
		devices,
		audioDevices,
		videoDevices,
		isLoading,
		error,
		enumerateDevices,
		requestPermissions,
		getStream,
	};
}
