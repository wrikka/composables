import { computed, onMounted, onUnmounted, ref } from "vue";

export type OrientationType =
	| "portrait-primary"
	| "portrait-secondary"
	| "landscape-primary"
	| "landscape-secondary"
	| "any";
export type OrientationLockType =
	| "any"
	| "natural"
	| "landscape"
	| "portrait"
	| "portrait-primary"
	| "portrait-secondary"
	| "landscape-primary"
	| "landscape-secondary";

export interface UseScreenOrientationOptions {
	onLock?: (orientation: OrientationType) => void;
	onUnlock?: () => void;
	onChange?: (orientation: OrientationType) => void;
	onError?: (error: string) => void;
}

export function useScreenOrientation(
	options: UseScreenOrientationOptions = {},
) {
	const { onLock, onUnlock, onChange, onError } = options;

	const isSupported = ref(!!screen.orientation);
	const orientation = ref<OrientationType>("any");
	const angle = ref(0);
	const isLocked = ref(false);
	const error = ref<string | null>(null);

	const updateOrientation = () => {
		if (isSupported.value && screen.orientation) {
			orientation.value = screen.orientation.type as OrientationType;
			angle.value = screen.orientation.angle;
		} else {
			// Fallback to window orientation
			const windowAngle = window.orientation || 0;
			angle.value = Math.abs(windowAngle);

			if (angle.value === 0 || angle.value === 180) {
				orientation.value = "portrait-primary";
			} else {
				orientation.value = "landscape-primary";
			}
		}
	};

	const lock = async (lockType: OrientationLockType): Promise<boolean> => {
		if (!isSupported.value) {
			const errorMsg = "Screen orientation API is not supported";
			error.value = errorMsg;
			onError?.(errorMsg);
			return false;
		}

		try {
			if (screen.orientation && (screen.orientation as any).lock) {
				await (screen.orientation as any).lock(lockType);
				isLocked.value = true;
				error.value = null;
				onLock?.(screen.orientation.type as OrientationType);
				return true;
			} else {
				throw new Error("Screen orientation lock is not supported");
			}
		} catch (err) {
			const errorMsg =
				err instanceof Error ? err.message : "Failed to lock orientation";
			error.value = errorMsg;
			onError?.(errorMsg);
			return false;
		}
	};

	const unlock = async (): Promise<boolean> => {
		if (!isSupported.value) {
			const errorMsg = "Screen orientation API is not supported";
			error.value = errorMsg;
			onError?.(errorMsg);
			return false;
		}

		try {
			await screen.orientation.unlock();
			isLocked.value = false;
			error.value = null;
			onUnlock?.();
			return true;
		} catch (err) {
			const errorMsg =
				err instanceof Error ? err.message : "Failed to unlock orientation";
			error.value = errorMsg;
			onError?.(errorMsg);
			return false;
		}
	};

	const isPortrait = computed(() => {
		return orientation.value.startsWith("portrait");
	});

	const isLandscape = computed(() => {
		return orientation.value.startsWith("landscape");
	});

	const isPrimary = computed(() => {
		return orientation.value.endsWith("primary");
	});

	const isSecondary = computed(() => {
		return orientation.value.endsWith("secondary");
	});

	const getOrientation = (): OrientationType => {
		return orientation.value;
	};

	const getAngle = (): number => {
		return angle.value;
	};

	const handleOrientationChange = () => {
		const previousOrientation = orientation.value;
		updateOrientation();

		if (previousOrientation !== orientation.value) {
			onChange?.(orientation.value);
		}
	};

	const handleResize = () => {
		const previousOrientation = orientation.value;
		updateOrientation();

		if (previousOrientation !== orientation.value) {
			onChange?.(orientation.value);
		}
	};

	onMounted(() => {
		updateOrientation();

		if (isSupported.value && screen.orientation) {
			screen.orientation.addEventListener("change", handleOrientationChange);
		} else {
			// Fallback to resize event
			window.addEventListener("resize", handleResize);
			window.addEventListener("orientationchange", handleOrientationChange);
		}
	});

	onUnmounted(() => {
		if (isSupported.value && screen.orientation) {
			screen.orientation.removeEventListener("change", handleOrientationChange);
		} else {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("orientationchange", handleOrientationChange);
		}
	});

	return {
		isSupported,
		orientation,
		angle,
		isLocked,
		error,
		isPortrait,
		isLandscape,
		isPrimary,
		isSecondary,
		lock,
		unlock,
		getOrientation,
		getAngle,
		updateOrientation,
	};
}

// Device orientation helper
export interface DeviceOrientationOptions {
	onAbsolute?: (absolute: boolean) => void;
	onAlpha?: (alpha: number | null) => void;
	onBeta?: (beta: number | null) => void;
	onGamma?: (gamma: number | null) => void;
	onHeading?: (heading: number | null) => void;
	onError?: (error: string) => void;
}

export function useDeviceOrientation(options: DeviceOrientationOptions = {}) {
	const { onAbsolute, onAlpha, onBeta, onGamma, onHeading, onError } = options;

	const isSupported = ref(!!window.DeviceOrientationEvent);
	const absolute = ref(false);
	const alpha = ref<number | null>(null);
	const beta = ref<number | null>(null);
	const gamma = ref<number | null>(null);
	const heading = ref<number | null>(null);
	const error = ref<string | null>(null);

	const requestPermission = async (): Promise<boolean> => {
		if (!isSupported.value) {
			const errorMsg = "Device orientation API is not supported";
			error.value = errorMsg;
			onError?.(errorMsg);
			return false;
		}

		// Check if permission is needed (iOS 13+)
		if (
			typeof (DeviceOrientationEvent as any).requestPermission === "function"
		) {
			try {
				const permission = await (
					DeviceOrientationEvent as any
				).requestPermission();
				if (permission !== "granted") {
					const errorMsg = "Device orientation permission denied";
					error.value = errorMsg;
					onError?.(errorMsg);
					return false;
				}
			} catch (err) {
				const errorMsg =
					err instanceof Error ? err.message : "Failed to request permission";
				error.value = errorMsg;
				onError?.(errorMsg);
				return false;
			}
		}

		return true;
	};

	const handleOrientation = (event: DeviceOrientationEvent) => {
		absolute.value = event.absolute;
		alpha.value = event.alpha;
		beta.value = event.beta;
		gamma.value = event.gamma;

		// Calculate heading if alpha is available
		if (event.alpha !== null) {
			heading.value = Math.round(event.alpha);
		} else {
			heading.value = null;
		}

		onAbsolute?.(event.absolute);
		onAlpha?.(event.alpha);
		onBeta?.(event.beta);
		onGamma?.(event.gamma);
		onHeading?.(heading.value);
	};

	const start = async (): Promise<boolean> => {
		const hasPermission = await requestPermission();
		if (!hasPermission) {
			return false;
		}

		window.addEventListener("deviceorientation", handleOrientation);
		return true;
	};

	const stop = () => {
		window.removeEventListener("deviceorientation", handleOrientation);
	};

	const clear = () => {
		absolute.value = false;
		alpha.value = null;
		beta.value = null;
		gamma.value = null;
		heading.value = null;
		error.value = null;
	};

	const getCompassHeading = (): number | null => {
		if (alpha.value === null) return null;

		// Convert alpha (0-360) to compass heading (0=N, 90=E, 180=S, 270=W)
		return Math.round(360 - alpha.value);
	};

	const isUpright = computed(() => {
		if (beta.value === null || gamma.value === null) return false;
		return Math.abs(beta.value) < 30 && Math.abs(gamma.value) < 30;
	});

	const isTilted = computed(() => {
		return !isUpright.value;
	});

	const getTiltAngle = (): number | null => {
		if (beta.value === null || gamma.value === null) return null;

		// Calculate total tilt from beta and gamma
		return Math.sqrt(beta.value ** 2 + gamma.value ** 2);
	};

	onMounted(() => {
		// Auto-start if permission is already granted
		if (isSupported.value) {
			start();
		}
	});

	onUnmounted(() => {
		stop();
	});

	return {
		isSupported,
		absolute,
		alpha,
		beta,
		gamma,
		heading,
		error,
		isUpright,
		isTilted,
		requestPermission,
		start,
		stop,
		clear,
		getCompassHeading,
		getTiltAngle,
	};
}
