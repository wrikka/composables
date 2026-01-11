import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePermission } from "./usePermission";

// Mock Permissions API
const mockPermission = {
	state: "granted",
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
};

const mockQuery = vi.fn().mockResolvedValue(mockPermission);

Object.defineProperty(navigator, "permissions", {
	value: {
		query: mockQuery,
	},
	writable: true,
});

// Mock Geolocation API
const mockGetCurrentPosition = vi.fn().mockImplementation((success) => {
	success({ coords: { latitude: 0, longitude: 0 } });
});

Object.defineProperty(navigator, "geolocation", {
	value: {
		getCurrentPosition: mockGetCurrentPosition,
	},
	writable: true,
});

// Mock Notification API
Object.defineProperty(window, "Notification", {
	value: {
		requestPermission: vi.fn().mockResolvedValue("granted"),
	},
	writable: true,
});

// Mock MediaDevices API
const mockGetUserMedia = vi.fn().mockResolvedValue({
	getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
});

Object.defineProperty(navigator, "mediaDevices", {
	value: {
		getUserMedia: mockGetUserMedia,
	},
	writable: true,
});

describe("usePermission", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockPermission.state = "granted";
	});

	it("should detect permissions API support", () => {
		const { isSupported } = usePermission("geolocation");
		expect(isSupported.value).toBe(true);
	});

	it("should query permission state", async () => {
		const { state, queryPermission } = usePermission("geolocation");

		const result = await queryPermission();

		expect(result).toBe("granted");
		expect(state.value).toBe("granted");
		expect(mockQuery).toHaveBeenCalledWith({ name: "geolocation" });
	});

	it("should handle permission change", async () => {
		const { state } = usePermission("geolocation");

		await new Promise((resolve) => setTimeout(resolve, 0));

		mockPermission.state = "denied";
		const changeCallback = mockPermission.addEventListener.mock.calls.find(
			([event]) => event === "change",
		)?.[1];

		if (changeCallback) {
			changeCallback();
		}
		expect(state.value).toBe("denied");
	});

	it("should request geolocation permission", async () => {
		const { requestPermission } = usePermission("geolocation");

		const result = await requestPermission();

		expect(result).toBe("granted");
		expect(mockGetCurrentPosition).toHaveBeenCalled();
	});

	it("should handle geolocation permission denial", async () => {
		mockGetCurrentPosition.mockImplementation((_success, error) => {
			const positionError = new Error(
				"Permission denied",
			) as unknown as GeolocationPositionError;
			Object.defineProperty(positionError, "code", {
				value: 1,
				writable: true,
				configurable: true,
			});
			error(positionError);
		});

		const { requestPermission } = usePermission("geolocation");

		const result = await requestPermission();

		expect(result).toBe("denied");
	});

	it("should request notification permission", async () => {
		const { requestPermission } = usePermission("notifications");

		const result = await requestPermission();

		expect(result).toBe("granted");
		expect(Notification.requestPermission).toHaveBeenCalled();
	});

	it("should request camera permission", async () => {
		const { requestPermission } = usePermission("camera");

		const result = await requestPermission();

		expect(result).toBe("granted");
		expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
			video: true,
		});
	});

	it("should request microphone permission", async () => {
		const { requestPermission } = usePermission("microphone");

		const result = await requestPermission();

		expect(result).toBe("granted");
		expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
			audio: true,
		});
	});

	it("should handle media permission denial", async () => {
		mockGetUserMedia.mockRejectedValueOnce(new Error("Permission denied"));

		const { requestPermission } = usePermission("camera");

		const result = await requestPermission();

		expect(result).toBe("denied");
	});

	it("should provide computed properties", async () => {
		const { isGranted, isDenied, isPrompt, queryPermission } =
			usePermission("geolocation");

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(isGranted.value).toBe(true);
		expect(isDenied.value).toBe(false);
		expect(isPrompt.value).toBe(false);

		mockPermission.state = "denied";
		await queryPermission();

		expect(isGranted.value).toBe(false);
		expect(isDenied.value).toBe(true);
		expect(isPrompt.value).toBe(false);
	});

	it("should handle unsupported API", () => {
		const originalPermissions = navigator.permissions;
		delete (navigator as any).permissions;

		const { isSupported, queryPermission } = usePermission("geolocation");

		expect(isSupported.value).toBe(false);

		queryPermission().then((state) => {
			expect(state).toBe("prompt");
		});

		// Restore
		Object.defineProperty(navigator, "permissions", {
			value: originalPermissions,
			writable: true,
		});
	});
});
