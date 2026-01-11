import { onMounted, onUnmounted, ref } from "vue";

export interface UseGeolocationOptions {
	enableHighAccuracy?: boolean;
	timeout?: number;
	maximumAge?: number;
	watchPosition?: boolean;
}

export interface GeolocationPosition {
	latitude: number;
	longitude: number;
	altitude: number | null;
	accuracy: number;
	altitudeAccuracy: number | null;
	heading: number | null;
	speed: number | null;
	timestamp: number;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
	const {
		enableHighAccuracy = true,
		timeout = 10000,
		maximumAge = 0,
		watchPosition = false,
	} = options;

	const position = ref<GeolocationPosition | null>(null);
	const error = ref<string | null>(null);
	const isLoading = ref(false);

	let watchId: number | null = null;

	const isSupported = ref(!!navigator.geolocation);

	const handleSuccess = (pos: globalThis.GeolocationPosition) => {
		position.value = {
			latitude: pos.coords.latitude,
			longitude: pos.coords.longitude,
			altitude: pos.coords.altitude,
			accuracy: pos.coords.accuracy,
			altitudeAccuracy: pos.coords.altitudeAccuracy,
			heading: pos.coords.heading,
			speed: pos.coords.speed,
			timestamp: pos.timestamp,
		};
		error.value = null;
		isLoading.value = false;
	};

	const handleError = (err: GeolocationPositionError) => {
		error.value = getErrorMessage(err.code);
		position.value = null;
		isLoading.value = false;
	};

	const getErrorMessage = (code: number): string => {
		switch (code) {
			case 1:
				return "Location permission denied";
			case 2:
				return "Location position unavailable";
			case 3:
				return "Location request timeout";
			default:
				return "Unknown location error";
		}
	};

	const getCurrentPosition = () => {
		if (!isSupported.value) {
			error.value = "Geolocation is not supported";
			return;
		}

		isLoading.value = true;
		error.value = null;

		navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
			enableHighAccuracy,
			timeout,
			maximumAge,
		});
	};

	const startWatching = () => {
		if (!isSupported.value) {
			error.value = "Geolocation is not supported";
			return;
		}

		if (watchId !== null) {
			stopWatching();
		}

		isLoading.value = true;
		error.value = null;

		watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
			enableHighAccuracy,
			timeout,
			maximumAge,
		});
	};

	const stopWatching = () => {
		if (watchId !== null) {
			navigator.geolocation.clearWatch(watchId);
			watchId = null;
		}
		isLoading.value = false;
	};

	const calculateDistance = (
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number,
	): number => {
		const R = 6371; // Earth's radius in kilometers
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLon = ((lon2 - lon1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	const distanceFrom = (latitude: number, longitude: number): number | null => {
		if (!position.value) return null;
		return calculateDistance(
			position.value.latitude,
			position.value.longitude,
			latitude,
			longitude,
		);
	};

	onMounted(() => {
		if (watchPosition) {
			startWatching();
		}
	});

	onUnmounted(() => {
		stopWatching();
	});

	return {
		position,
		error,
		isLoading,
		isSupported,
		getCurrentPosition,
		startWatching,
		stopWatching,
		calculateDistance,
		distanceFrom,
	};
}
