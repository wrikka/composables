import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { easeInOutCubic } from "./easing";
import { useTween } from "./useTween";

vi.useFakeTimers();

describe("useTween", () => {
	it("should tween a value over time", () => {
		const from = ref(0);
		const to = ref(100);
		const value = useTween(from, to, { duration: 1000 });

		expect(value.value).toBe(0);

		vi.advanceTimersByTime(500);
		expect(value.value).toBe(50);

		vi.advanceTimersByTime(500);
		expect(value.value).toBe(100);
	});

	it("should use the provided easing function", () => {
		const from = ref(0);
		const to = ref(100);
		const value = useTween(from, to, {
			duration: 1000,
			easing: easeInOutCubic,
		});

		vi.advanceTimersByTime(500);
		expect(value.value).toBe(easeInOutCubic(0.5) * 100);
	});

	it("should call onFinished when the tween completes", () => {
		const onFinished = vi.fn();
		useTween(0, 100, { duration: 1000, onFinished });

		vi.advanceTimersByTime(1000);
		expect(onFinished).toHaveBeenCalledTimes(1);
	});

	it("should call onUpdate with the current value", () => {
		const onUpdate = vi.fn();
		useTween(0, 100, { duration: 1000, onUpdate });

		vi.advanceTimersByTime(500);
		expect(onUpdate).toHaveBeenCalledWith(50);
	});
});
