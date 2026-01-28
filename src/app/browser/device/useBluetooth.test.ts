import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBluetooth } from "./useBluetooth";

const mockBluetoothDevice = {
	id: "test-device-id",
	name: "Test Device",
	addEventListener: vi.fn(),
};

const mockRequestDevice = vi.fn().mockResolvedValue(mockBluetoothDevice);
const mockGetDevice = vi.fn().mockResolvedValue({
	gatt: {
		connect: vi.fn().mockResolvedValue({}),
	},
});

declare global {
	interface Navigator {
		bluetooth?: {
			requestDevice: (options: any) => Promise<any>;
			getDevice: (id: string) => Promise<any>;
		};
	}
}

Object.defineProperty(navigator, "bluetooth", {
	value: {
		requestDevice: mockRequestDevice,
		getDevice: mockGetDevice,
	},
	writable: true,
});

describe("useBluetooth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with correct default values", () => {
		const { isSupported, device, server, isConnected, isScanning, error } = useBluetooth();

		expect(isSupported.value).toBe(true);
		expect(device.value).toBeNull();
		expect(server.value).toBeNull();
		expect(isConnected.value).toBe(false);
		expect(isScanning.value).toBe(false);
		expect(error.value).toBeNull();
	});

	it("should request device successfully", async () => {
		const { requestDevice, device } = useBluetooth();

		const result = await requestDevice();

		expect(result).not.toBeNull();
		expect(mockRequestDevice).toHaveBeenCalled();
		expect(device.value).toEqual({
			id: "test-device-id",
			name: "Test Device",
		});
	});

	it("should handle request device error", async () => {
		const mockError = new Error("User cancelled");
		mockRequestDevice.mockRejectedValue(mockError);

		const { requestDevice, error } = useBluetooth();

		const result = await requestDevice();

		expect(result).toBeNull();
		expect(error.value).toBe(mockError);
	});

	it("should connect to device successfully", async () => {
		const { requestDevice, connect, isConnected } = useBluetooth();

		await requestDevice();
		const result = await connect();

		expect(result).toBe(true);
		expect(isConnected.value).toBe(true);
	});

	it("should handle connect without device", async () => {
		const { connect, error } = useBluetooth();

		const result = await connect();

		expect(result).toBe(false);
		expect(error.value?.message).toBe("No device selected");
	});

	it("should disconnect device", async () => {
		const { requestDevice, connect, disconnect, isConnected, server } = useBluetooth();

		await requestDevice();
		await connect();
		disconnect();

		expect(isConnected.value).toBe(false);
		expect(server.value).toBeNull();
	});

	it("should scan for devices", async () => {
		const { scan, isScanning } = useBluetooth();

		const devices = await scan();

		expect(isScanning.value).toBe(false);
		expect(devices.length).toBeGreaterThan(0);
		expect(mockRequestDevice).toHaveBeenCalled();
	});

	it("should handle unsupported browser", () => {
		delete (navigator as any).bluetooth;

		const { isSupported } = useBluetooth();

		expect(isSupported.value).toBe(false);

		Object.defineProperty(navigator, "bluetooth", {
			value: {
				requestDevice: mockRequestDevice,
				getDevice: mockGetDevice,
			},
			writable: true,
		});
	});

	it("should handle scan error", async () => {
		const mockError = new Error("Scan failed");
		mockRequestDevice.mockRejectedValue(mockError);

		const { scan, error } = useBluetooth();

		const devices = await scan();

		expect(devices).toEqual([]);
		expect(error.value).toBe(mockError);
	});
});
