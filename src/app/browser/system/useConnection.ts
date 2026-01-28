import { onMounted, onUnmounted, ref } from "vue";

export interface NetworkConnection {
	effectiveType: "slow-2g" | "2g" | "3g" | "4g";
	downlink: number;
	downlinkMax: number;
	rtt: number;
	saveData: boolean;
	type:
		| "bluetooth"
		| "cellular"
		| "ethernet"
		| "none"
		| "wifi"
		| "wimax"
		| "other"
		| "unknown";
}

export function useConnection() {
	const isSupported = ref("connection" in navigator);
	const connection = ref<NetworkConnection | null>(null);
	const online = ref(navigator.onLine);

	const updateConnection = () => {
		if (!isSupported.value) return;

		const conn = (navigator as any).connection;
		if (conn) {
			connection.value = {
				effectiveType: conn.effectiveType,
				downlink: conn.downlink,
				downlinkMax: conn.downlinkMax,
				rtt: conn.rtt,
				saveData: conn.saveData,
				type: conn.type,
			};
		}
	};

	const handleConnectionChange = () => {
		updateConnection();
	};

	const handleOnline = () => {
		online.value = true;
	};

	const handleOffline = () => {
		online.value = false;
	};

	const isSlowConnection = () => {
		if (!connection.value) return false;
		return (
			connection.value.effectiveType === "slow-2g" ||
			connection.value.effectiveType === "2g"
		);
	};

	const isFastConnection = () => {
		if (!connection.value) return false;
		return connection.value.effectiveType === "4g";
	};

	const getConnectionQuality = () => {
		if (!connection.value) return "unknown";

		switch (connection.value.effectiveType) {
			case "slow-2g":
				return "very-poor";
			case "2g":
				return "poor";
			case "3g":
				return "good";
			case "4g":
				return "excellent";
			default:
				return "unknown";
		}
	};

	onMounted(() => {
		updateConnection();

		if (isSupported.value) {
			const conn = (navigator as any).connection;
			if (conn) {
				conn.addEventListener("change", handleConnectionChange);
			}
		}

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
	});

	onUnmounted(() => {
		if (isSupported.value) {
			const conn = (navigator as any).connection;
			if (conn) {
				conn.removeEventListener("change", handleConnectionChange);
			}
		}

		window.removeEventListener("online", handleOnline);
		window.removeEventListener("offline", handleOffline);
	});

	return {
		isSupported,
		connection,
		online,
		isSlowConnection,
		isFastConnection,
		getConnectionQuality,
	};
}
