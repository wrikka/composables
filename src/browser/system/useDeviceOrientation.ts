import { onMounted, onUnmounted, ref } from "vue";

export interface DeviceOrientationOptions {
	onOrientation?: (event: DeviceOrientationEvent) => void;
	onMotion?: (event: DeviceMotionEvent) => void;
}

export interface OrientationData {
	alpha: number | null;
	beta: number | null;
	gamma: number | null;
}

export interface MotionData {
	acceleration: {
		x: number | null;
		y: number | null;
		z: number | null;
	};
	accelerationIncludingGravity: {
		x: number | null;
		y: number | null;
		z: number | null;
	};
	rotationRate: {
		alpha: number | null;
		beta: number | null;
		gamma: number | null;
	};
}

export function useDeviceOrientation(options: DeviceOrientationOptions = {}) {
	const isSupported = ref(
		"DeviceOrientationEvent" in window && "DeviceMotionEvent" in window,
	);
	const orientation = ref<OrientationData>({
		alpha: null,
		beta: null,
		gamma: null,
	});
	const motion = ref<MotionData>({
		acceleration: { x: null, y: null, z: null },
		accelerationIncludingGravity: { x: null, y: null, z: null },
		rotationRate: { alpha: null, beta: null, gamma: null },
	});
	const error = ref<string | null>(null);

	const handleOrientation = (event: DeviceOrientationEvent) => {
		orientation.value = {
			alpha: event.alpha,
			beta: event.beta,
			gamma: event.gamma,
		};
		options.onOrientation?.(event);
	};

	const handleMotion = (event: DeviceMotionEvent) => {
		motion.value = {
			acceleration: {
				x: event.acceleration?.x ?? null,
				y: event.acceleration?.y ?? null,
				z: event.acceleration?.z ?? null,
			},
			accelerationIncludingGravity: {
				x: event.accelerationIncludingGravity?.x ?? null,
				y: event.accelerationIncludingGravity?.y ?? null,
				z: event.accelerationIncludingGravity?.z ?? null,
			},
			rotationRate: {
				alpha: event.rotationRate?.alpha ?? null,
				beta: event.rotationRate?.beta ?? null,
				gamma: event.rotationRate?.gamma ?? null,
			},
		};
		options.onMotion?.(event);
	};

	const requestPermission = async (): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = "Device orientation not supported";
			return false;
		}

		// iOS 13+ requires permission
		if (
			typeof (DeviceOrientationEvent as any).requestPermission === "function"
		) {
			try {
				const permission = await (
					DeviceOrientationEvent as any
				).requestPermission();
				return permission === "granted";
			} catch (err) {
				console.warn("Permission request failed:", err);
				error.value = "Permission request failed";
				return false;
			}
		}

		return true;
	};

	const isUpright = (): boolean => {
		const { beta, gamma } = orientation.value;
		if (beta === null || gamma === null) return false;

		// Device is roughly upright (beta between -45 and 45 degrees)
		return Math.abs(beta) < 45 && Math.abs(gamma) < 45;
	};

	const isLandscape = (): boolean => {
		const { beta } = orientation.value;
		if (beta === null) return false;

		// Device is in landscape orientation (beta around 90 or -90)
		return Math.abs(beta) > 45;
	};

	const getTiltAngle = (): number => {
		const { beta, gamma } = orientation.value;
		if (beta === null || gamma === null) return 0;

		return Math.sqrt(beta * beta + gamma * gamma);
	};

	onMounted(() => {
		if (isSupported.value) {
			window.addEventListener("deviceorientation", handleOrientation);
			window.addEventListener("devicemotion", handleMotion);
		}
	});

	onUnmounted(() => {
		window.removeEventListener("deviceorientation", handleOrientation);
		window.removeEventListener("devicemotion", handleMotion);
	});

	return {
		isSupported,
		orientation,
		motion,
		error,
		requestPermission,
		isUpright,
		isLandscape,
		getTiltAngle,
	};
}
