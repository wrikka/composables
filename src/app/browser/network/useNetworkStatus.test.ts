import { describe, expect, it, vi, beforeEach } from "vitest";
import { useNetworkStatus } from "./useNetworkStatus";

const mockConnection = {
	downlink: 10,
	effectiveType: "4g",
	rtt: 100,
	saveData: false,
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
};

describe("useNetworkStatus", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(navigator, "onLine", {
			value: true,
			writable: true,
		});
		delete (navigator as any).connection;
		delete (navigator as any).mozConnection;
		delete (navigator as any).webkitConnection;
	});

	it("should initialize with default values", () => {
		const { isOnline, offlineAt, downlink, effectiveType, rtt, saveData, status } = useNetworkStatus();

		expect(isOnline.value).toBe(true);
		expect(offlineAt.value).toBeNull();
		expect(downlink.value).toBe(0);
		expect(effectiveType.value).toBe("");
		expect(rtt.value).toBe(0);
		expect(saveData.value).toBe(false);
		expect(status.value).toEqual({
			isOnline: true,
			offlineAt: null,
			downlink: 0,
			effectiveType: "",
			rtt: 0,
			saveData: false,
		});
	});

	it("should detect offline status", () => {
		Object.defineProperty(navigator, "onLine", {
			value: false,
			writable: true,
		});

		const { isOnline } = useNetworkStatus();

		expect(isOnline.value).toBe(false);
	});

	it("should get network connection info", () => {
		(navigator as any).connection = mockConnection;

		const { downlink, effectiveType, rtt, saveData } = useNetworkStatus();

		expect(downlink.value).toBe(10);
		expect(effectiveType.value).toBe("4g");
		expect(rtt.value).toBe(100);
		expect(saveData.value).toBe(false);
	});

	it("should handle mozConnection", () => {
		(navigator as any).mozConnection = mockConnection;

		const { downlink, effectiveType } = useNetworkStatus();

		expect(downlink.value).toBe(10);
		expect(effectiveType.value).toBe("4g");
	});

	it("should handle webkitConnection", () => {
		(navigator as any).webkitConnection = mockConnection;

		const { downlink, effectiveType } = useNetworkStatus();

		expect(downlink.value).toBe(10);
		expect(effectiveType.value).toBe("4g");
	});

	it("should provide complete status object", () => {
		(navigator as any).connection = mockConnection;

		const { status } = useNetworkStatus();

		expect(status.value).toEqual({
			isOnline: true,
			offlineAt: null,
			downlink: 10,
			effectiveType: "4g",
			rtt: 100,
			saveData: false,
		});
	});

	it("should handle missing connection API", () => {
		const { downlink, effectiveType, rtt, saveData } = useNetworkStatus();

		expect(downlink.value).toBe(0);
		expect(effectiveType.value).toBe("");
		expect(rtt.value).toBe(0);
		expect(saveData.value).toBe(false);
	});

	it("should listen for connection changes", () => {
		(navigator as any).connection = mockConnection;

		useNetworkStatus();

		expect(mockConnection.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
	});

	it("should provide reactive values", () => {
		const { isOnline, downlink, effectiveType } = useNetworkStatus();

		expect(typeof isOnline.value).toBe("boolean");
		expect(typeof downlink.value).toBe("number");
		expect(typeof effectiveType.value).toBe("string");
	});
});
