import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useTextAnimation } from "./useTextAnimation";

vi.useFakeTimers();

describe("useTextAnimation", () => {
	it("should animate text over time", () => {
		const text = "Hello World";
		const { animatedText } = useTextAnimation(text, { interval: 100 });

		expect(animatedText.value).toBe("");

		vi.advanceTimersByTime(100);
		expect(animatedText.value).toBe("H");

		vi.advanceTimersByTime(400);
		expect(animatedText.value).toBe("Hello");

		vi.advanceTimersByTime(600);
		expect(animatedText.value).toBe("Hello World");
	});

	it("should stop when text is fully animated", () => {
		const text = "Hi";
		const { animatedText, isActive } = useTextAnimation(text, {
			interval: 100,
		});

		expect(isActive.value).toBe(true);

		vi.advanceTimersByTime(200);
		expect(animatedText.value).toBe("Hi");
		expect(isActive.value).toBe(false);

		vi.advanceTimersByTime(100);
		expect(animatedText.value).toBe("Hi");
	});

	it("should be restartable", () => {
		const text = "Test";
		const { animatedText, restart } = useTextAnimation(text, { interval: 100 });

		vi.advanceTimersByTime(400);
		expect(animatedText.value).toBe("Test");

		restart();
		expect(animatedText.value).toBe("");

		vi.advanceTimersByTime(100);
		expect(animatedText.value).toBe("T");
	});

	it("should work with a ref as text source", () => {
		const text = ref("Initial");
		const { animatedText } = useTextAnimation(text, { interval: 100 });

		vi.advanceTimersByTime(700);
		expect(animatedText.value).toBe("Initial");

		text.value = "Updated";
		vi.advanceTimersByTime(700);
		// The animation continues from the current index, so it will be fully shown
		expect(animatedText.value).toBe("Updated");
	});
});
