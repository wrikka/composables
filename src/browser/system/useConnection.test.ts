import { beforeEach, describe, expect, it, vi } from "vitest";
import { useConnection } from "./useConnection";

// Mock Network Information API
const mockConnection = {
	effectiveType: "4g",
	downlink: 10,
	downlinkMax: 50,
	rtt: 50,
	saveData: false,
	type: "wifi",
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
};

Object.defineProperty(navigator, "connection", {
	value: mockConnection,
	writable: true,
});

Object.defineProperty(navigator, "onLine", {
	value: true,
	writable: true,
});

describe("useConnection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockConnection.effectiveType = "4g";
		mockConnection.downlink = 10;
		mockConnection.downlinkMax = 50;
		mockConnection.rtt = 50;
		mockConnection.saveData = false;
		mockConnection.type = "wifi";
		vi.stubGlobal("navigator", {
			...navigator,
			onLine: true,
		});
	});

	it("should detect connection API support", () => {
		const { isSupported } = useConnection();
		expect(isSupported.value).toBe(true);
	});

	it("should initialize connection info", () => {
		const { connection, online } = useConnection();

		expect(connection.value).toEqual({
			effectiveType: "4g",
			downlink: 10,
			downlinkMax: 50,
			rtt: 50,
			saveData: false,
			type: "wifi",
		});
		expect(online.value).toBe(true);
	});

	it("should detect slow connection", () => {
		mockConnection.effectiveType = "2g";
		const { isSlowConnection } = useConnection();

		expect(isSlowConnection()).toBe(true);
	});

	it("should detect fast connection", () => {
		mockConnection.effectiveType = "4g";
		const { isFastConnection } = useConnection();

		expect(isFastConnection()).toBe(true);
	});

	it("should get connection quality", () => {
		const { getConnectionQuality } = useConnection();

		mockConnection.effectiveType = "slow-2g";
		expect(getConnectionQuality()).toBe("very-poor");

		mockConnection.effectiveType = "2g";
		expect(getConnectionQuality()).toBe("poor");

		mockConnection.effectiveType = "3g";
		expect(getConnectionQuality()).toBe("good");

		mockConnection.effectiveType = "4g";
		expect(getConnectionQuality()).toBe("excellent");
	});

	it("should handle connection change", () => {
		const { connection } = useConnection();

		mockConnection.effectiveType = "3g";
		mockConnection.downlink = 5;

		const changeCallback = mockConnection.addEventListener.mock.calls.find(
			([event]) => event === "change",
		)?.[1];

		expect(changeCallback).toBeDefined();
		if (changeCallback) {
			changeCallback();
		}
		expect(connection.value?.effectiveType).toBe("3g");
		expect(connection.value?.downlink).toBe(5);
	});

	it("should handle online/offline events", () => {
		const { online } = useConnection();

		window.dispatchEvent(new Event("offline"));
		expect(online.value).toBe(false);

		window.dispatchEvent(new Event("online"));
		expect(online.value).toBe(true);
	});

	it("should handle unsupported API", () => {
		const originalConnection = (navigator as any).connection;
		vi.stubGlobal("navigator", {
			...navigator,
			connection: undefined,
		});

		const { isSupported, connection } = useConnection();

		expect(isSupported.value).toBe(false);
		expect(connection.value).toBe(null);

		// Restore
		Object.defineProperty(navigator, "connection", {
			value: originalConnection,
			writable: true,
		});
	});
});
