import { ref } from "vue";
import { useIntervalFn } from "../../ui/animation/useIntervalFn";

interface MemoryInfo {
	jsHeapSizeLimit: number;
	totalJSHeapSize: number;
	usedJSHeapSize: number;
}

export function useMemory() {
	const memory = ref<MemoryInfo | null>(null);

	const updateMemoryInfo = () => {
		if ("performance" in window && "memory" in performance) {
			memory.value = (performance as any).memory as MemoryInfo;
		}
	};

	useIntervalFn(updateMemoryInfo, 1000);

	return { memory };
}
