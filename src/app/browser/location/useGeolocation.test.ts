import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGeolocation } from "./useGeolocation";

describe("useGeolocation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with default values", () => {
		vi.stubGlobal("navigator", {
			geolocation: {
				getCurrentPosition: vi.fn(),
				watchPosition: vi.fn(),
				clearWatch: vi.fn(),
			},
		});

		const { position, error, isLoading, isSupported } = useGeolocation();

		expect(position.value).toBe(null);
		expect(error.value).toBe(null);
		expect(isLoading.value).toBe(false);
		expect(isSupported.value).toBe(true);

		vi.unstubAllGlobals();
	});

	it("should handle unsupported geolocation", () => {
		vi.stubGlobal("navigator", {
			geolocation: undefined,
		});

		const { isSupported, error } = useGeolocation();

		expect(isSupported.value).toBe(false);

		expect(error.value).toBe("Geolocation is not supported");

		vi.unstubAllGlobals();
	});

	it("should get current position successfully", async () => {
		const mockPosition = {
			coords: {
				latitude: 40.7128,
				longitude: -74.006,
				altitude: 100,
				accuracy: 10,
				altitudeAccuracy: 5,
				heading: 90,
				speed: 5,
			},
			timestamp: Date.now(),
		};

		vi.stubGlobal("navigator", {
			geolocation: {
				getCurrentPosition: vi.fn((success) => success(mockPosition)),
				watchPosition: vi.fn(),
				clearWatch: vi.fn(),
			},
		});

		const { position, error, isLoading, getCurrentPosition } = useGeolocation();

		getCurrentPosition();

		expect(isLoading.value).toBe(true);

		// Wait for async operation
		await vi.runAllTimersAsync();

		expect(position.value).toEqual({
			latitude: 40.7128,
			longitude: -74.006,
			altitude: 100,
			accuracy: 10,
			altitudeAccuracy: 5,
			heading: 90,
			speed: 5,
			timestamp: mockPosition.timestamp,
		});
		expect(error.value).toBe(null);
		expect(isLoading.value).toBe(false);

		vi.unstubAllGlobals();
	});

	it("should handle geolocation error", async () => {
		vi.stubGlobal("navigator", {
			geolocation: {
				getCurrentPosition: vi.fn((_error) => _error({ code: 1 })),
				watchPosition: vi.fn(),
				clearWatch: vi.fn(),
			},
		});

		const { position, error, isLoading, getCurrentPosition } = useGeolocation();

		getCurrentPosition();

		// Wait for async operation
		await vi.runAllTimersAsync();

		expect(position.value).toBe(null);
		expect(error.value).toBe("Location permission denied");
		expect(isLoading.value).toBe(false);

		vi.unstubAllGlobals();
	});

	it("should start and stop watching position", () => {
		const mockPosition = {
			coords: {
				latitude: 40.7128,
				longitude: -74.006,
				altitude: null,
				accuracy: 10,
				altitudeAccuracy: null,
				heading: null,
				speed: null,
			},
			timestamp: Date.now(),
		};

		vi.stubGlobal("navigator", {
			geolocation: {
				getCurrentPosition: vi.fn(),
				watchPosition: vi.fn((success) => {
					// Simulate immediate success
					setTimeout(() => success(mockPosition), 0);
					return 1; // Return watch ID
				}),
				clearWatch: vi.fn(),
			},
		});

		const { startWatching, stopWatching, position } = useGeolocation();

		startWatching();
		expect(navigator.geolocation.watchPosition).toHaveBeenCalled();

		vi.runAllTimers();
		expect(position.value).toEqual({
			latitude: 40.7128,
			longitude: -74.006,
			altitude: null,
			accuracy: 10,
			altitudeAccuracy: null,
			heading: null,
			speed: null,
			timestamp: mockPosition.timestamp,
		});

		stopWatching();
		expect(navigator.geolocation.clearWatch).toHaveBeenCalledWith(1);

		vi.unstubAllGlobals();
	});

	it("should start watching on mount when watchPosition is true", () => {
		vi.stubGlobal("navigator", {
			geolocation: {
				getCurrentPosition: vi.fn(),
				watchPosition: vi.fn(),
				clearWatch: vi.fn(),
			},
		});

		useGeolocation({ watchPosition: true });

		expect(navigator.geolocation.watchPosition).toHaveBeenCalled();

		vi.unstubAllGlobals();
	});

	it("should calculate distance between two points", () => {
		vi.stubGlobal("navigator", {
			geolocation: {
				getCurrentPosition: vi.fn(),
				watchPosition: vi.fn(),
				clearWatch: vi.fn(),
			},
		});

		const { calculateDistance } = useGeolocation();

		// Distance from NYC to LA (approximately 3935 km)
		const distance = calculateDistance(40.7128, -74.006, 34.0522, -118.2437);
		expect(distance).toBeCloseTo(3935, -2); // Allow 2% tolerance

		vi.unstubAllGlobals();
	});

	it("should calculate distance from current position", async () => {
		const mockPosition = {
			coords: {
				latitude: 40.7128,
				longitude: -74.006,
				altitude: null,
				accuracy: 10,
				altitudeAccuracy: null,
				heading: null,
				speed: null,
			},
			timestamp: Date.now(),
		};

		vi.stubGlobal("navigator", {
			geolocation: {
				getCurrentPosition: vi.fn((success) => success(mockPosition)),
				watchPosition: vi.fn(),
				clearWatch: vi.fn(),
			},
		});

		const { getCurrentPosition, distanceFrom } = useGeolocation();

		getCurrentPosition();
		await vi.runAllTimersAsync();

		const distance = distanceFrom(34.0522, -118.2437);
		expect(distance).toBeCloseTo(3935, -2);

		// Should return null when no position
		const { distanceFrom: distFrom } = useGeolocation();
		const noDistance = distFrom(34.0522, -118.2437);
		expect(noDistance).toBe(null);

		vi.unstubAllGlobals();
	});

	it("should use custom options", () => {
		vi.stubGlobal("navigator", {
			geolocation: {
				getCurrentPosition: vi.fn(),
				watchPosition: vi.fn(),
				clearWatch: vi.fn(),
			},
		});

		const options = {
			enableHighAccuracy: false,
			timeout: 5000,
			maximumAge: 60000,
		};

		const { getCurrentPosition } = useGeolocation(options);

		getCurrentPosition();
		expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
			expect.any(Function),
			expect.any(Function),
			options,
		);

		vi.unstubAllGlobals();
	});

	it("should handle different error codes", async () => {
		vi.stubGlobal("navigator", {
			geolocation: {
				getCurrentPosition: vi.fn(),
				watchPosition: vi.fn(),
				clearWatch: vi.fn(),
			},
		});

		const { getCurrentPosition, error } = useGeolocation();

		// Test error code 1
		navigator.geolocation.getCurrentPosition = vi.fn((error) =>
			error({ code: 1 }),
		);
		getCurrentPosition();
		await vi.runAllTimersAsync();
		expect(error.value).toBe("Location permission denied");

		// Test error code 2
		navigator.geolocation.getCurrentPosition = vi.fn((error) =>
			error({ code: 2 }),
		);
		getCurrentPosition();
		await vi.runAllTimersAsync();
		expect(error.value).toBe("Location position unavailable");

		// Test error code 3
		navigator.geolocation.getCurrentPosition = vi.fn((error) =>
			error({ code: 3 }),
		);
		getCurrentPosition();
		await vi.runAllTimersAsync();
		expect(error.value).toBe("Location request timeout");

		vi.unstubAllGlobals();
	});
});
