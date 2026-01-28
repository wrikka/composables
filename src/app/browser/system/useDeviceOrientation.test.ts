import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDeviceOrientation } from "./useDeviceOrientation";

// Mock DeviceOrientationEvent and DeviceMotionEvent
const mockDeviceOrientationEvent = vi.fn().mockImplementation((type, init) => {
	const event = new Event(type) as any;
	Object.assign(event, init || {});
	return event;
});

const mockDeviceMotionEvent = vi.fn().mockImplementation((type, init) => {
	const event = new Event(type) as any;
	Object.assign(event, init || {});
	return event;
});

// Mock global constructors
Object.defineProperty(window, "DeviceOrientationEvent", {
	value: mockDeviceOrientationEvent,
	writable: true,
	configurable: true,
});

Object.defineProperty(window, "DeviceMotionEvent", {
	value: mockDeviceMotionEvent,
	writable: true,
	configurable: true,
});

describe("useDeviceOrientation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should detect device orientation support", () => {
		const { isSupported } = useDeviceOrientation();
		expect(isSupported.value).toBe(true);
	});

	it("should handle orientation events", () => {
		const onOrientation = vi.fn();
		const { orientation } = useDeviceOrientation({ onOrientation });

		const event = new DeviceOrientationEvent("deviceorientation", {
			alpha: 45,
			beta: 30,
			gamma: 15,
		});

		window.dispatchEvent(event);

		expect(orientation.value).toEqual({
			alpha: 45,
			beta: 30,
			gamma: 15,
		});
		expect(onOrientation).toHaveBeenCalledWith(event);
	});

	it("should handle motion events", () => {
		const onMotion = vi.fn();
		const { motion } = useDeviceOrientation({ onMotion });

		const event = new DeviceMotionEvent("devicemotion", {
			acceleration: { x: 1, y: 2, z: 3 },
			accelerationIncludingGravity: { x: 1.1, y: 2.1, z: 3.1 },
			rotationRate: { alpha: 0.5, beta: 0.3, gamma: 0.1 },
		});

		window.dispatchEvent(event);

		expect(motion.value).toEqual({
			acceleration: { x: 1, y: 2, z: 3 },
			accelerationIncludingGravity: { x: 1.1, y: 2.1, z: 3.1 },
			rotationRate: { alpha: 0.5, beta: 0.3, gamma: 0.1 },
		});
		expect(onMotion).toHaveBeenCalledWith(event);
	});

	it("should handle null values in motion events", () => {
		const { motion } = useDeviceOrientation();

		const eventInit: DeviceMotionEventInit = {
			accelerationIncludingGravity: { x: null, y: 1, z: null },
			rotationRate: { alpha: null, beta: null, gamma: 0.2 },
		};

		const event = new DeviceMotionEvent("devicemotion", eventInit);

		window.dispatchEvent(event);

		expect(motion.value).toEqual({
			acceleration: { x: null, y: null, z: null },
			accelerationIncludingGravity: { x: null, y: 1, z: null },
			rotationRate: { alpha: null, beta: null, gamma: 0.2 },
		});
	});

	it("should check if device is upright", () => {
		const { isUpright, orientation } = useDeviceOrientation();

		orientation.value = { alpha: 0, beta: 30, gamma: 20 };
		expect(isUpright()).toBe(true);

		orientation.value = { alpha: 0, beta: 60, gamma: 20 };
		expect(isUpright()).toBe(false);

		orientation.value = { alpha: 0, beta: null, gamma: 20 };
		expect(isUpright()).toBe(false);
	});

	it("should check if device is in landscape", () => {
		const { isLandscape, orientation } = useDeviceOrientation();

		orientation.value = { alpha: 0, beta: 60, gamma: 0 };
		expect(isLandscape()).toBe(true);

		orientation.value = { alpha: 0, beta: 30, gamma: 0 };
		expect(isLandscape()).toBe(false);

		orientation.value = { alpha: 0, beta: null, gamma: 0 };
		expect(isLandscape()).toBe(false);
	});

	it("should calculate tilt angle", () => {
		const { getTiltAngle, orientation } = useDeviceOrientation();

		orientation.value = { alpha: 0, beta: 30, gamma: 40 };
		expect(getTiltAngle()).toBeCloseTo(50, 1);

		orientation.value = { alpha: 0, beta: 0, gamma: 0 };
		expect(getTiltAngle()).toBe(0);

		orientation.value = { alpha: 0, beta: null, gamma: 40 };
		expect(getTiltAngle()).toBe(0);
	});

	it("should request permission on iOS", async () => {
		const mockRequestPermission = vi.fn().mockResolvedValue("granted");
		(DeviceOrientationEvent as any).requestPermission = mockRequestPermission;

		const { requestPermission } = useDeviceOrientation();

		const result = await requestPermission();

		expect(result).toBe(true);
		expect(mockRequestPermission).toHaveBeenCalled();
	});

	it("should handle permission denial", async () => {
		const mockRequestPermission = vi.fn().mockResolvedValue("denied");
		(DeviceOrientationEvent as any).requestPermission = mockRequestPermission;

		const { requestPermission, error } = useDeviceOrientation();

		const result = await requestPermission();

		expect(result).toBe(false);
		expect(error.value).toBe("Permission request failed");
	});

	it("should handle unsupported device", async () => {
		// Remove support
		delete (window as any).DeviceOrientationEvent;
		delete (window as any).DeviceMotionEvent;

		const { isSupported, requestPermission, error } = useDeviceOrientation();

		expect(isSupported.value).toBe(false);

		const result = await requestPermission();
		expect(result).toBe(false);
		expect(error.value).toBe("Device orientation not supported");

		// Restore
		Object.defineProperty(window, "DeviceOrientationEvent", {
			value: mockDeviceOrientationEvent,
			writable: true,
			configurable: true,
		});
		Object.defineProperty(window, "DeviceMotionEvent", {
			value: mockDeviceMotionEvent,
			writable: true,
			configurable: true,
		});
	});
});
