import { onMounted, onUnmounted, ref } from "vue";

export interface BatteryInfo {
	charging: boolean;
	chargingTime: number;
	dischargingTime: number;
	level: number;
}

export function useBattery() {
	const isSupported = ref(false);
	const charging = ref(false);
	const chargingTime = ref(0);
	const dischargingTime = ref(0);
	const level = ref(1);

	let battery: any = null;

	const updateBatteryInfo = () => {
		if (!battery) return;

		charging.value = battery.charging;
		chargingTime.value = battery.chargingTime;
		dischargingTime.value = battery.dischargingTime;
		level.value = battery.level;
	};

	const handleBatteryEvent = () => {
		updateBatteryInfo();
	};

	const setupBattery = async () => {
		if (!("getBattery" in navigator)) {
			isSupported.value = false;
			return;
		}

		try {
			battery = await (navigator as any).getBattery();
			isSupported.value = true;

			updateBatteryInfo();

			battery.addEventListener("chargingchange", handleBatteryEvent);
			battery.addEventListener("chargingtimechange", handleBatteryEvent);
			battery.addEventListener("dischargingtimechange", handleBatteryEvent);
			battery.addEventListener("levelchange", handleBatteryEvent);
		} catch (error) {
			console.warn("Battery API not available:", error);
			isSupported.value = false;
		}
	};

	onMounted(() => {
		setupBattery();
	});

	onUnmounted(() => {
		if (battery) {
			battery.removeEventListener("chargingchange", handleBatteryEvent);
			battery.removeEventListener("chargingtimechange", handleBatteryEvent);
			battery.removeEventListener("dischargingtimechange", handleBatteryEvent);
			battery.removeEventListener("levelchange", handleBatteryEvent);
		}
	});

	return {
		isSupported,
		charging,
		chargingTime,
		dischargingTime,
		level,
	};
}
