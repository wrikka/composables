import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useSvg } from "./useSvg";

vi.useFakeTimers();

// Mock SVGPathElement
const mockPath = {
	getTotalLength: () => 100,
	style: {
		strokeDasharray: "",
		strokeDashoffset: "",
	},
} as unknown as SVGPathElement;

describe("useSvg", () => {
	it("should initialize path styles and animate progress", () => {
		const path = ref<SVGPathElement | null>(mockPath);
		const { progress } = useSvg(path, { duration: 1000 });

		expect(mockPath.style.strokeDasharray).toBe("100");
		expect(mockPath.style.strokeDashoffset).toBe("100");
		expect(progress.value).toBe(0);

		vi.advanceTimersByTime(500);
		expect(progress.value).toBe(0.5);
		expect(mockPath.style.strokeDashoffset).toBe("50");

		vi.advanceTimersByTime(500);
		expect(progress.value).toBe(1);
		expect(mockPath.style.strokeDashoffset).toBe("0");
	});

	it("should not start immediately if immediate is false", () => {
		const path = ref<SVGPathElement | null>(mockPath);
		useSvg(path, { immediate: false });

		vi.advanceTimersByTime(500);
		expect(mockPath.style.strokeDashoffset).toBe("100");
	});

	it("should be playable and pausable", () => {
		const path = ref<SVGPathElement | null>(mockPath);
		const { play, pause } = useSvg(path, { immediate: false });

		play();
		vi.advanceTimersByTime(300);
		pause();
		vi.advanceTimersByTime(500);

		expect(mockPath.style.strokeDashoffset).toBe("70");
	});

	it("should be resettable", () => {
		const path = ref<SVGPathElement | null>(mockPath);
		const { progress, reset } = useSvg(path);

		vi.advanceTimersByTime(500);
		expect(progress.value).toBe(0.5);

		reset();
		expect(progress.value).toBe(0);
		expect(mockPath.style.strokeDashoffset).toBe("100");
	});
});
