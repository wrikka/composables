import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	useDeviceOrientation,
	useScreenOrientation,
} from "./useScreenOrientation";

describe("useScreenOrientation", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		vi.stubGlobal("screen", {
			orientation: {
				type: "portrait-primary",
				angle: 0,
				lock: vi.fn().mockResolvedValue(undefined),
				unlock: vi.fn().mockResolvedValue(undefined),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			} as any,
		});

		vi.stubGlobal("window", {
			orientation: 0,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		});
	});

	it("should initialize with default values", () => {
		const { isSupported, orientation, angle, isLocked, error } =
			useScreenOrientation();

		expect(isSupported.value).toBe(true);
		expect(orientation.value).toBe("portrait-primary");
		expect(angle.value).toBe(0);
		expect(isLocked.value).toBe(false);
		expect(error.value).toBe(null);
	});

	it("should handle unsupported browser", () => {
		vi.stubGlobal("screen", {});

		const { isSupported } = useScreenOrientation();

		expect(isSupported.value).toBe(false);

		vi.unstubAllGlobals();
	});

	it("should update orientation from screen API", () => {
		const { updateOrientation, orientation, angle } = useScreenOrientation();

		// Mock different orientation
		Object.defineProperty(screen.orientation, "type", {
			value: "landscape-primary",
			writable: true,
			configurable: true,
		});
		Object.defineProperty(screen.orientation, "angle", {
			value: 90,
			writable: true,
			configurable: true,
		});

		updateOrientation();

		expect(orientation.value).toBe("landscape-primary");
		expect(angle.value).toBe(90);
	});

	it("should fallback to window orientation", () => {
		vi.stubGlobal("screen", {});

		const { orientation, angle, updateOrientation } = useScreenOrientation();

		// Mock window orientation
		Object.defineProperty(window, "orientation", {
			value: 90,
			writable: true,
			configurable: true,
		});

		updateOrientation();

		expect(orientation.value).toBe("landscape-primary");
		expect(angle.value).toBe(90);

		vi.unstubAllGlobals();
	});

	it("should lock orientation successfully", async () => {
		const onLock = vi.fn();
		const { lock, isLocked } = useScreenOrientation({ onLock });

		const result = await lock("landscape");

		expect(result).toBe(true);
		expect((screen.orientation as any).lock).toHaveBeenCalledWith("landscape");
		expect(isLocked.value).toBe(true);
		expect(onLock).toHaveBeenCalledWith("portrait-primary");
	});

	it("should handle lock error", async () => {
		const mockError = new Error("Lock failed");
		vi.mocked((screen.orientation as any).lock).mockRejectedValue(mockError);

		const onError = vi.fn();
		const { lock, isLocked, error } = useScreenOrientation({ onError });

		const result = await lock("landscape");

		expect(result).toBe(false);
		expect(isLocked.value).toBe(false);
		expect(error.value).toBe("Lock failed");
		expect(onError).toHaveBeenCalledWith("Lock failed");
	});

	it("should unlock orientation successfully", async () => {
		const onUnlock = vi.fn();
		const { unlock, isLocked } = useScreenOrientation({ onUnlock });

		const result = await unlock();

		expect(result).toBe(true);
		expect(screen.orientation.unlock).toHaveBeenCalled();
		expect(isLocked.value).toBe(false);
		expect(onUnlock).toHaveBeenCalled();
	});

	it("should handle unlock error", async () => {
		const mockError = new Error("Unlock failed");
		vi.mocked(screen.orientation.unlock).mockRejectedValue(mockError);

		const onError = vi.fn();
		const { unlock, error } = useScreenOrientation({ onError });

		const result = await unlock();

		expect(result).toBe(false);
		expect(error.value).toBe("Unlock failed");
		expect(onError).toHaveBeenCalledWith("Unlock failed");
	});

	it("should handle unsupported operations", async () => {
		vi.stubGlobal("screen", {});

		const { lock, unlock, error } = useScreenOrientation();

		const lockResult = await lock("landscape");
		expect(lockResult).toBe(false);
		expect(error.value).toBe("Screen orientation API is not supported");

		error.value = null;

		const unlockResult = await unlock();
		expect(unlockResult).toBe(false);
		expect(error.value).toBe("Screen orientation API is not supported");

		vi.unstubAllGlobals();
	});

	it("should provide orientation computed properties", () => {
		// Mock screen orientation type for testing
		Object.defineProperty(screen.orientation, "type", {
			value: "portrait-secondary",
			writable: true,
			configurable: true,
		});

		const { isPortrait, isLandscape, isPrimary, isSecondary } =
			useScreenOrientation();

		expect(isPortrait.value).toBe(true);
		expect(isLandscape.value).toBe(false);
		expect(isPrimary.value).toBe(false);
		expect(isSecondary.value).toBe(true);
	});

	it("should handle orientation change events", () => {
		const onChange = vi.fn();
		const { orientation } = useScreenOrientation({ onChange });

		// Simulate orientation change
		const changeHandler = (
			screen.orientation.addEventListener as any
		).mock.calls?.find((call: any) => call[0] === "change")?.[1];

		expect(changeHandler).toBeDefined();
		// Mock screen orientation type
		Object.defineProperty(screen.orientation, "type", {
			value: "landscape-primary",
			writable: true,
			configurable: true,
		});
		changeHandler();

		expect(orientation.value).toBe("landscape-primary");
		expect(onChange).toHaveBeenCalledWith("landscape-primary");
	});

	it("should use fallback events when screen API not supported", () => {
		vi.stubGlobal("screen", {});

		useScreenOrientation();

		expect(window.addEventListener).toHaveBeenCalledWith(
			"resize",
			expect.any(Function),
		);
		expect(window.addEventListener).toHaveBeenCalledWith(
			"orientationchange",
			expect.any(Function),
		);

		vi.unstubAllGlobals();
	});

	it("should get orientation and angle", () => {
		const { getOrientation, getAngle, updateOrientation } =
			useScreenOrientation();

		// Mock screen orientation properties
		Object.defineProperty(screen.orientation, "type", {
			value: "landscape-secondary",
			writable: true,
			configurable: true,
		});
		Object.defineProperty(screen.orientation, "angle", {
			value: 270,
			writable: true,
			configurable: true,
		});

		updateOrientation();

		expect(getOrientation()).toBe("landscape-secondary");
		expect(getAngle()).toBe(270);
	});
});

describe("useDeviceOrientation", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		vi.stubGlobal("window", {
			DeviceOrientationEvent: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		} as any);
	});

	it("should initialize with default values", () => {
		const { isSupported, absolute, alpha, beta, gamma, heading, error } =
			useDeviceOrientation();

		expect(isSupported.value).toBe(true);
		expect(absolute.value).toBe(false);
		expect(alpha.value).toBe(null);
		expect(beta.value).toBe(null);
		expect(gamma.value).toBe(null);
		expect(heading.value).toBe(null);
		expect(error.value).toBe(null);
	});

	it("should handle unsupported browser", () => {
		vi.stubGlobal("window", {});

		const { isSupported } = useDeviceOrientation();

		expect(isSupported.value).toBe(false);

		vi.unstubAllGlobals();
	});

	it("should request permission successfully", async () => {
		// Mock permission request
		vi.mocked(DeviceOrientationEvent as any).requestPermission = vi
			.fn()
			.mockResolvedValue("granted");

		const { requestPermission, error } = useDeviceOrientation();

		const result = await requestPermission();

		expect(result).toBe(true);
		expect(error.value).toBe(null);
	});

	it("should handle permission denial", async () => {
		vi.mocked(DeviceOrientationEvent as any).requestPermission = vi
			.fn()
			.mockResolvedValue("denied");

		const onError = vi.fn();
		const { requestPermission, error } = useDeviceOrientation({ onError });

		const result = await requestPermission();

		expect(result).toBe(false);
		expect(error.value).toBe("Device orientation permission denied");
		expect(onError).toHaveBeenCalledWith(
			"Device orientation permission denied",
		);
	});

	it("should handle permission request error", async () => {
		vi.mocked(DeviceOrientationEvent as any).requestPermission = vi
			.fn()
			.mockRejectedValue(new Error("Permission error"));

		const { requestPermission, error } = useDeviceOrientation();

		const result = await requestPermission();

		expect(result).toBe(false);
		expect(error.value).toBe("Permission error");
	});

	it("should handle device orientation events", () => {
		const onAlpha = vi.fn();
		const onBeta = vi.fn();
		const onGamma = vi.fn();
		const onHeading = vi.fn();
		const { alpha, beta, gamma, heading } = useDeviceOrientation({
			onAlpha,
			onBeta,
			onGamma,
			onHeading,
		});

		// Find the orientation event handler
		const orientationHandler = (
			window.addEventListener as any
		).mock.calls?.find((call: any) => call[0] === "deviceorientation")?.[1];

		expect(orientationHandler).toBeDefined();
		const mockEvent = {
			absolute: true,
			alpha: 45.5,
			beta: 10.2,
			gamma: -5.8,
		};

		orientationHandler(mockEvent);

		expect(alpha.value).toBe(45.5);
		expect(beta.value).toBe(10.2);
		expect(gamma.value).toBe(-5.8);
		expect(heading.value).toBe(46); // Rounded
		expect(onAlpha).toHaveBeenCalledWith(45.5);
		expect(onBeta).toHaveBeenCalledWith(10.2);
		expect(onGamma).toHaveBeenCalledWith(-5.8);
		expect(onHeading).toHaveBeenCalledWith(46);
	});

	it("should handle null alpha values", () => {
		const { heading } = useDeviceOrientation();

		const orientationHandler = (
			window.addEventListener as any
		).mock.calls?.find((call: any) => call[0] === "deviceorientation")?.[1];

		expect(orientationHandler).toBeDefined();
		const mockEvent = {
			absolute: false,
			alpha: null,
			beta: 0,
			gamma: 0,
		};

		orientationHandler(mockEvent);

		expect(heading.value).toBe(null);
	});

	it("should start and stop listening", async () => {
		vi.mocked(DeviceOrientationEvent as any).requestPermission = vi
			.fn()
			.mockResolvedValue("granted");

		const { start, stop } = useDeviceOrientation();

		const result = await start();
		expect(result).toBe(true);
		expect(window.addEventListener).toHaveBeenCalledWith(
			"deviceorientation",
			expect.any(Function),
		);

		stop();
		expect(window.removeEventListener).toHaveBeenCalledWith(
			"deviceorientation",
			expect.any(Function),
		);
	});

	it("should clear values", () => {
		const { absolute, alpha, beta, gamma, heading, error, clear } =
			useDeviceOrientation();

		// Set some values
		absolute.value = true;
		alpha.value = 45;
		beta.value = 10;
		gamma.value = -5;
		heading.value = 315;
		error.value = "some error";

		clear();

		expect(absolute.value).toBe(false);
		expect(alpha.value).toBe(null);
		expect(beta.value).toBe(null);
		expect(gamma.value).toBe(null);
		expect(heading.value).toBe(null);
		expect(error.value).toBe(null);
	});

	it("should calculate compass heading", () => {
		const { alpha, getCompassHeading } = useDeviceOrientation();

		alpha.value = 90;
		expect(getCompassHeading()).toBe(270); // 360 - 90

		alpha.value = 0;
		expect(getCompassHeading()).toBe(360); // 360 - 0

		alpha.value = null;
		expect(getCompassHeading()).toBe(null);
	});

	it("should determine if device is upright", () => {
		const { beta, gamma, isUpright, isTilted } = useDeviceOrientation();

		beta.value = 20;
		gamma.value = 15;

		expect(isUpright.value).toBe(true);
		expect(isTilted.value).toBe(false);

		beta.value = 45;
		gamma.value = 10;

		expect(isUpright.value).toBe(false);
		expect(isTilted.value).toBe(true);

		beta.value = null;
		gamma.value = null;

		expect(isUpright.value).toBe(false);
		expect(isTilted.value).toBe(false);
	});

	it("should calculate tilt angle", () => {
		const { beta, gamma, getTiltAngle } = useDeviceOrientation();

		beta.value = 30;
		gamma.value = 40;

		// sqrt(30^2 + 40^2) = sqrt(900 + 1600) = sqrt(2500) = 50
		expect(getTiltAngle()).toBe(50);

		beta.value = null;
		gamma.value = null;

		expect(getTiltAngle()).toBe(null);
	});

	it("should handle unsupported device orientation", async () => {
		vi.stubGlobal("window", {});

		const { isSupported, requestPermission, error } = useDeviceOrientation();

		expect(isSupported.value).toBe(false);

		const result = await requestPermission();
		expect(result).toBe(false);
		expect(error.value).toBe("Device orientation API is not supported");

		vi.unstubAllGlobals();
	});

	it("should handle missing permission request method", async () => {
		// DeviceOrientationEvent exists but no requestPermission method
		vi.mocked(DeviceOrientationEvent as any).requestPermission = undefined;

		const { requestPermission } = useDeviceOrientation();

		const result = await requestPermission();
		expect(result).toBe(true); // Should proceed without permission request
	});
});
