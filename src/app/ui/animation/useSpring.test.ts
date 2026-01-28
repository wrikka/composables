import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useSpring } from "./useSpring";

vi.useFakeTimers();

describe("useSpring", () => {
	it("should spring to the target value", () => {
		const target = ref(100);
		const value = useSpring(target);

		expect(value.value).toBe(100); // Initial value is target

		target.value = 200;
		vi.advanceTimersByTime(1000);

		// The value should be close to the target after some time
		expect(value.value).toBeCloseTo(200);
	});

	it("should stop when precision is reached", () => {
		const target = ref(100);
		const value = useSpring(target, { stiffness: 500, damping: 100 });

		target.value = 200;
		vi.advanceTimersByTime(500); // Let it animate for a bit

		vi.advanceTimersByTime(5000); // Let it settle
		expect(value.value).toBeCloseTo(200);

		// It should not change after settling
		const valueAfterSettled = value.value;
		vi.advanceTimersByTime(1000);
		expect(value.value).toBe(valueAfterSettled);
	});
});
