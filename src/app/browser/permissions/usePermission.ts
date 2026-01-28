import { computed, onMounted, onUnmounted, ref } from "vue";

export type PermissionName =
	| "geolocation"
	| "notifications"
	| "persistent-storage"
	| "push"
	| "screen-wake-lock"
	| "camera"
	| "microphone"
	| "speaker"
	| "device-info"
	| "background-fetch"
	| "background-sync"
	| "bluetooth"
	| "accessibility-events"
	| "ambient-light-sensor"
	| "accelerometer"
	| "gyroscope"
	| "magnetometer"
	| "clipboard-read"
	| "clipboard-write"
	| "payment-handler"
	| "periodic-background-sync";

export type PermissionState = "granted" | "denied" | "prompt";

export interface PermissionStatus {
	name: PermissionName;
	state: PermissionState;
	addEventListener: (type: string, listener: EventListener) => void;
	removeEventListener: (type: string, listener: EventListener) => void;
}

export function usePermission(permissionName: PermissionName) {
	const isSupported = ref("permissions" in navigator);
	const state = ref<PermissionState>("prompt");
	const isLoading = ref(false);
	const error = ref<Error | null>(null);

	let permissionStatus: PermissionStatus | null = null;

	const updatePermissionState = () => {
		if (permissionStatus) {
			state.value = permissionStatus.state;
		}
	};

	const handlePermissionChange = () => {
		updatePermissionState();
	};

	const queryPermission = async (): Promise<PermissionState> => {
		if (!isSupported.value) {
			error.value = new Error("Permissions API not supported");
			return "prompt";
		}

		if (isLoading.value) return state.value;

		isLoading.value = true;
		error.value = null;

		try {
			const permission = await navigator.permissions.query({
				name: permissionName as any,
			});

			permissionStatus = permission as PermissionStatus;
			state.value = permission.state;

			permission.addEventListener("change", handlePermissionChange);

			return permission.state;
		} catch (err) {
			error.value = err as Error;
			console.warn("Permission query failed:", err);
			return "prompt";
		} finally {
			isLoading.value = false;
		}
	};

	const requestPermission = async (): Promise<PermissionState> => {
		// Some permissions need to be requested through specific APIs
		switch (permissionName) {
			case "geolocation":
				return await requestGeolocationPermission();
			case "notifications":
				return await requestNotificationPermission();
			case "camera":
			case "microphone":
				return await requestMediaPermission(permissionName);
			default:
				// For other permissions, just query the current state
				return await queryPermission();
		}
	};

	const requestGeolocationPermission = async (): Promise<PermissionState> => {
		try {
			await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					timeout: 1000,
				});
			});
			return "granted";
		} catch (err) {
			const error = err as GeolocationPositionError;
			return error.code === 1 ? "denied" : "prompt";
		}
	};

	const requestNotificationPermission = async (): Promise<PermissionState> => {
		if ("Notification" in window) {
			return (await Notification.requestPermission()) as PermissionState;
		}
		return "prompt";
	};

	const requestMediaPermission = async (
		type: "camera" | "microphone",
	): Promise<PermissionState> => {
		try {
			const constraints = type === "camera" ? { video: true } : { audio: true };
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			stream.getTracks().forEach((track) => track.stop());
			return "granted";
		} catch {
			return "denied";
		}
	};

	const isGranted = computed(() => state.value === "granted");
	const isDenied = computed(() => state.value === "denied");
	const isPrompt = computed(() => state.value === "prompt");

	onMounted(() => {
		queryPermission();
	});

	onUnmounted(() => {
		if (permissionStatus) {
			permissionStatus.removeEventListener("change", handlePermissionChange);
		}
	});

	return {
		isSupported,
		state,
		isLoading,
		error,
		isGranted,
		isDenied,
		isPrompt,
		queryPermission,
		requestPermission,
	};
}
