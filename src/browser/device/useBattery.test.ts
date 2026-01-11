import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBattery } from "./useBattery";

// Mock navigator.getBattery
const mockBattery = {
	charging: false,
	chargingTime: 3600,
	dischargingTime: Infinity,
	level: 0.8,
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
};

const mockGetBattery = vi.fn().mockResolvedValue(mockBattery);

// Extend navigator type for testing
declare global {
	interface Navigator {
		getBattery?: () => Promise<BatteryManager>;
	}

	interface BatteryManager extends EventTarget {
		readonly charging: boolean;
		readonly chargingTime: number;
		readonly dischargingTime: number;
		readonly level: number;
		addEventListener: (type: string, listener: EventListener) => void;
		removeEventListener: (type: string, listener: EventListener) => void;
	}
}

Object.defineProperty(navigator, "getBattery", {
	value: mockGetBattery,
	writable: true,
});

describe("useBattery", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockBattery.charging = false;
		mockBattery.chargingTime = 3600;
		mockBattery.dischargingTime = Infinity;
		mockBattery.level = 0.8;
	});

	it("should initialize battery info when supported", async () => {
		const { isSupported, charging, chargingTime, dischargingTime, level } =
			useBattery();

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(isSupported.value).toBe(true);
		expect(charging.value).toBe(false);
		expect(chargingTime.value).toBe(3600);
		expect(dischargingTime.value).toBe(Infinity);
		expect(level.value).toBe(0.8);
	});

	it("should handle unsupported browsers", async () => {
		const originalGetBattery = navigator.getBattery;
		delete (navigator as any).getBattery;

		const { isSupported } = useBattery();

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(isSupported.value).toBe(false);

		// Restore
		Object.defineProperty(navigator, "getBattery", {
			value: originalGetBattery,
			writable: true,
		});
	});

	it("should update battery info on events", async () => {
		const { level } = useBattery();

		await new Promise((resolve) => setTimeout(resolve, 0));

		// Simulate battery level change
		mockBattery.level = 0.5;
		const levelChangeCallback = mockBattery.addEventListener.mock.calls.find(
			([event]) => event === "levelchange",
		)?.[1];

		expect(levelChangeCallback).toBeDefined();
		levelChangeCallback();
		expect(level.value).toBe(0.5);
	});
});
