import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUSB } from "./useUSB";

const mockUSBDevice = {
	vendorId: 1234,
	productId: 5678,
	productName: "Test USB Device",
	manufacturerName: "Test Manufacturer",
	open: vi.fn().mockResolvedValue(undefined),
	close: vi.fn().mockResolvedValue(undefined),
};

const mockRequestDevice = vi.fn().mockResolvedValue(mockUSBDevice);
const mockGetDevices = vi.fn().mockResolvedValue([mockUSBDevice]);

declare global {
	interface Navigator {
		usb?: {
			requestDevice: (options: any) => Promise<any>;
			getDevices: () => Promise<any[]>;
		};
	}
}

Object.defineProperty(navigator, "usb", {
	value: {
		requestDevice: mockRequestDevice,
		getDevices: mockGetDevices,
	},
	writable: true,
});

describe("useUSB", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with correct default values", () => {
		const { isSupported, device, isConnected, error } = useUSB();

		expect(isSupported.value).toBe(true);
		expect(device.value).toBeNull();
		expect(isConnected.value).toBe(false);
		expect(error.value).toBeNull();
	});

	it("should request device successfully", async () => {
		const { requestDevice, device } = useUSB();

		const result = await requestDevice();

		expect(result).not.toBeNull();
		expect(mockRequestDevice).toHaveBeenCalled();
		expect(device.value).toEqual({
			vendorId: 1234,
			productId: 5678,
			productName: "Test USB Device",
			manufacturerName: "Test Manufacturer",
		});
	});

	it("should handle request device error", async () => {
		const mockError = new Error("User cancelled");
		mockRequestDevice.mockRejectedValue(mockError);

		const { requestDevice, error } = useUSB();

		const result = await requestDevice();

		expect(result).toBeNull();
		expect(error.value).toBe(mockError);
	});

	it("should connect to device successfully", async () => {
		const { requestDevice, connect, isConnected } = useUSB();

		await requestDevice();
		const result = await connect();

		expect(result).toBe(true);
		expect(isConnected.value).toBe(true);
		expect(mockUSBDevice.open).toHaveBeenCalled();
	});

	it("should handle connect without device", async () => {
		const { connect, error } = useUSB();

		const result = await connect();

		expect(result).toBe(false);
		expect(error.value?.message).toBe("No device selected");
	});

	it("should disconnect device", async () => {
		const { requestDevice, connect, disconnect, isConnected } = useUSB();

		await requestDevice();
		await connect();
		await disconnect();

		expect(isConnected.value).toBe(false);
		expect(mockUSBDevice.close).toHaveBeenCalled();
	});

	it("should get devices list", async () => {
		const { getDevices } = useUSB();

		const devices = await getDevices();

		expect(devices).toHaveLength(1);
		expect(mockGetDevices).toHaveBeenCalled();
	});

	it("should handle unsupported browser", () => {
		delete (navigator as any).usb;

		const { isSupported } = useUSB();

		expect(isSupported.value).toBe(false);

		Object.defineProperty(navigator, "usb", {
			value: {
				requestDevice: mockRequestDevice,
				getDevices: mockGetDevices,
			},
			writable: true,
		});
	});

	it("should handle get devices error", async () => {
		const mockError = new Error("Get devices failed");
		mockGetDevices.mockRejectedValue(mockError);

		const { getDevices, error } = useUSB();

		const devices = await getDevices();

		expect(devices).toEqual([]);
		expect(error.value).toBe(mockError);
	});
});
