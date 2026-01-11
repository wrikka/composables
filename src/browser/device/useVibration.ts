import { ref } from "vue";

export interface VibrationOptions {
	pattern?: number | number[];
	interval?: number;
}

export function useVibration() {
	const isSupported = ref("vibrate" in navigator);

	const vibrate = (pattern: number | number[] = 200): boolean => {
		if (!isSupported.value) {
			console.warn("Vibration API not supported");
			return false;
		}

		return navigator.vibrate(pattern as VibratePattern);
	};

	const vibratePattern = (patterns: number[], interval: number = 100): void => {
		if (!isSupported.value) {
			console.warn("Vibration API not supported");
			return;
		}

		let index = 0;
		const vibrateNext = () => {
			if (index < patterns.length) {
				const pattern = patterns[index];
				if (pattern !== undefined) {
					navigator.vibrate(pattern);
				}
				index++;
				setTimeout(vibrateNext, interval);
			}
		};

		vibrateNext();
	};

	const stopVibration = (): boolean => {
		if (!isSupported.value) {
			return false;
		}

		return navigator.vibrate(0);
	};

	const vibrateClick = (): boolean => vibrate(50);

	const vibrateNotification = (): boolean => vibrate([200, 100, 200]);

	const vibrateError = (): boolean => vibrate([100, 50, 100, 50, 200]);

	const vibrateSuccess = (): boolean => vibrate([100, 30, 100]);

	return {
		isSupported,
		vibrate,
		vibratePattern,
		stopVibration,
		vibrateClick,
		vibrateNotification,
		vibrateError,
		vibrateSuccess,
	};
}
