import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVibration } from "./useVibration";

// Mock navigator.vibrate
const mockVibrate = vi.fn();
Object.defineProperty(navigator, "vibrate", {
	value: mockVibrate,
	writable: true,
});

describe("useVibration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should detect vibration API support", () => {
		const { isSupported } = useVibration();
		expect(isSupported.value).toBe(true);
	});

	it("should call vibrate with default pattern", () => {
		const { vibrate } = useVibration();
		vibrate();
		expect(mockVibrate).toHaveBeenCalledWith(200);
	});

	it("should call vibrate with custom pattern", () => {
		const { vibrate } = useVibration();
		vibrate([100, 50, 100]);
		expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100]);
	});

	it("should stop vibration", () => {
		const { stopVibration } = useVibration();
		stopVibration();
		expect(mockVibrate).toHaveBeenCalledWith(0);
	});

	it("should vibrate for click", () => {
		const { vibrateClick } = useVibration();
		vibrateClick();
		expect(mockVibrate).toHaveBeenCalledWith(50);
	});

	it("should vibrate for notification", () => {
		const { vibrateNotification } = useVibration();
		vibrateNotification();
		expect(mockVibrate).toHaveBeenCalledWith([200, 100, 200]);
	});

	it("should vibrate for error", () => {
		const { vibrateError } = useVibration();
		vibrateError();
		expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100, 50, 200]);
	});

	it("should vibrate for success", () => {
		const { vibrateSuccess } = useVibration();
		vibrateSuccess();
		expect(mockVibrate).toHaveBeenCalledWith([100, 30, 100]);
	});

	it("should handle unsupported API", () => {
		const originalVibrate = navigator.vibrate;
		delete (navigator as any).vibrate;

		const { isSupported, vibrate } = useVibration();

		expect(isSupported.value).toBe(false);
		expect(vibrate()).toBe(false);

		// Restore
		Object.defineProperty(navigator, "vibrate", {
			value: originalVibrate,
			writable: true,
		});
	});
});
