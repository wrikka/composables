import { onMounted, onUnmounted, ref } from "vue";

export interface WakeLockOptions {
	onRequestError?: (error: Error) => void;
	onRelease?: () => void;
}

export function useWakeLock(options: WakeLockOptions = {}) {
	const isSupported = ref("wakeLock" in navigator);
	const isActive = ref(false);
	const isPending = ref(false);
	const error = ref<Error | null>(null);

	let wakeLockSentinel: WakeLockSentinel | null = null;

	const requestWakeLock = async (): Promise<boolean> => {
		if (!isSupported.value) {
			error.value = new Error("Wake Lock API not supported");
			return false;
		}

		if (isPending.value) return false;

		isPending.value = true;
		error.value = null;

		try {
			wakeLockSentinel = await navigator.wakeLock.request("screen");
			isActive.value = true;

			wakeLockSentinel.addEventListener("release", () => {
				isActive.value = false;
				wakeLockSentinel = null;
				options.onRelease?.();
			});

			return true;
		} catch (err) {
			error.value = err as Error;
			options.onRequestError?.(err as Error);
			return false;
		} finally {
			isPending.value = false;
		}
	};

	const releaseWakeLock = (): boolean => {
		if (!wakeLockSentinel) return false;

		try {
			wakeLockSentinel.release();
			wakeLockSentinel = null;
			isActive.value = false;
			return true;
		} catch (err) {
			error.value = err as Error;
			return false;
		}
	};

	const toggleWakeLock = async (): Promise<boolean> => {
		if (isActive.value) {
			return releaseWakeLock();
		} else {
			return await requestWakeLock();
		}
	};

	// Handle visibility change to reacquire wake lock
	const handleVisibilityChange = async () => {
		if (
			document.visibilityState === "visible" &&
			isActive.value &&
			!wakeLockSentinel
		) {
			await requestWakeLock();
		}
	};

	onMounted(() => {
		document.addEventListener("visibilitychange", handleVisibilityChange);
	});

	onUnmounted(() => {
		document.removeEventListener("visibilitychange", handleVisibilityChange);
		releaseWakeLock();
	});

	return {
		isSupported,
		isActive,
		isPending,
		error,
		requestWakeLock,
		releaseWakeLock,
		toggleWakeLock,
	};
}
