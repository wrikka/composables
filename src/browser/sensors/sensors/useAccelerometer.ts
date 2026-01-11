/// <reference types="w3c-generic-sensor" />
import { onMounted, onUnmounted, ref } from "vue";

interface AccelerometerOptions {
	frequency?: number;
}

export function useAccelerometer(options: AccelerometerOptions = {}) {
	const x = ref(0);
	const y = ref(0);
	const z = ref(0);
	const isSupported = "Accelerometer" in window;

	if (isSupported) {
		const accelerometer = new Accelerometer(options);

		const onReading = () => {
			x.value = accelerometer.x || 0;
			y.value = accelerometer.y || 0;
			z.value = accelerometer.z || 0;
		};

		onMounted(() => {
			accelerometer.addEventListener("reading", onReading);
			accelerometer.start();
		});

		onUnmounted(() => {
			accelerometer.removeEventListener("reading", onReading);
			accelerometer.stop();
		});
	}

	return { x, y, z, isSupported };
}
