import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSerialPort } from "./useSerialPort";

const mockReadableStream = {
	getReader: vi.fn().mockReturnValue({
		read: vi.fn().mockResolvedValue({ value: new Uint8Array([1, 2, 3]), done: false }),
		releaseLock: vi.fn(),
	}),
};

const mockWritableStream = {
	getWriter: vi.fn().mockReturnValue({
		write: vi.fn().mockResolvedValue(undefined),
		releaseLock: vi.fn(),
	}),
};

const mockSerialPort = {
	open: vi.fn().mockResolvedValue(undefined),
	close: vi.fn().mockResolvedValue(undefined),
	readable: mockReadableStream,
	writable: mockWritableStream,
};

const mockRequestPort = vi.fn().mockResolvedValue(mockSerialPort);
const mockGetPorts = vi.fn().mockResolvedValue([mockSerialPort]);

declare global {
	interface Navigator {
		serial?: {
			requestPort: () => Promise<any>;
			getPorts: () => Promise<any[]>;
		};
	}
}

Object.defineProperty(navigator, "serial", {
	value: {
		requestPort: mockRequestPort,
		getPorts: mockGetPorts,
	},
	writable: true,
});

describe("useSerialPort", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with correct default values", () => {
		const { isSupported, port, isOpen, error } = useSerialPort();

		expect(isSupported.value).toBe(true);
		expect(port.value).toBeNull();
		expect(isOpen.value).toBe(false);
		expect(error.value).toBeNull();
	});

	it("should request port successfully", async () => {
		const { requestPort, port } = useSerialPort();

		const result = await requestPort();

		expect(result).not.toBeNull();
		expect(mockRequestPort).toHaveBeenCalled();
		expect(port.value).toEqual({
			readable: null,
			writable: null,
		});
	});

	it("should handle request port error", async () => {
		const mockError = new Error("User cancelled");
		mockRequestPort.mockRejectedValue(mockError);

		const { requestPort, error } = useSerialPort();

		const result = await requestPort();

		expect(result).toBeNull();
		expect(error.value).toBe(mockError);
	});

	it("should open port successfully", async () => {
		const { requestPort, open, isOpen } = useSerialPort();

		await requestPort();
		const result = await open();

		expect(result).toBe(true);
		expect(isOpen.value).toBe(true);
		expect(mockSerialPort.open).toHaveBeenCalledWith({
			baudRate: 9600,
			dataBits: 8,
			stopBits: 1,
			parity: "none",
			bufferSize: 255,
		});
	});

	it("should handle open without port", async () => {
		const { open, error } = useSerialPort();

		const result = await open();

		expect(result).toBe(false);
		expect(error.value?.message).toBe("No port selected");
	});

	it("should close port", async () => {
		const { requestPort, open, close, isOpen } = useSerialPort();

		await requestPort();
		await open();
		await close();

		expect(isOpen.value).toBe(false);
		expect(mockSerialPort.close).toHaveBeenCalled();
	});

	it("should write data successfully", async () => {
		const { requestPort, open, write } = useSerialPort();

		await requestPort();
		await open();
		const data = new Uint8Array([1, 2, 3]);
		const result = await write(data);

		expect(result).toBe(true);
	});

	it("should handle write error when port not open", async () => {
		const { write, error } = useSerialPort();

		const data = new Uint8Array([1, 2, 3]);
		const result = await write(data);

		expect(result).toBe(false);
		expect(error.value?.message).toBe("Port is not open for writing");
	});

	it("should read data successfully", async () => {
		const { requestPort, open, read } = useSerialPort();

		await requestPort();
		await open();
		const result = await read();

		expect(result).not.toBeNull();
		expect(result).toEqual(new Uint8Array([1, 2, 3]));
	});

	it("should handle read error when port not open", async () => {
		const { read, error } = useSerialPort();

		const result = await read();

		expect(result).toBeNull();
		expect(error.value?.message).toBe("Port is not open for reading");
	});

	it("should get ports list", async () => {
		const { getPorts } = useSerialPort();

		const ports = await getPorts();

		expect(ports).toHaveLength(1);
		expect(mockGetPorts).toHaveBeenCalled();
	});

	it("should handle unsupported browser", () => {
		delete (navigator as any).serial;

		const { isSupported } = useSerialPort();

		expect(isSupported.value).toBe(false);

		Object.defineProperty(navigator, "serial", {
			value: {
				requestPort: mockRequestPort,
				getPorts: mockGetPorts,
			},
			writable: true,
		});
	});

	it("should use custom options", async () => {
		const { requestPort, open } = useSerialPort({
			baudRate: 115200,
			dataBits: 7,
			stopBits: 2,
			parity: "even",
			bufferSize: 512,
		});

		await requestPort();
		await open();

		expect(mockSerialPort.open).toHaveBeenCalledWith({
			baudRate: 115200,
			dataBits: 7,
			stopBits: 2,
			parity: "even",
			bufferSize: 512,
		});
	});
});
