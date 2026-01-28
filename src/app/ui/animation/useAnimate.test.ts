import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useAnimate } from "./useAnimate";

// Mock Web Animations API
const mockAnimation = {
	play: vi.fn(),
	pause: vi.fn(),
	reverse: vi.fn(),
	finish: vi.fn(),
	cancel: vi.fn(),
	commitStyles: vi.fn(),
	onfinish: null as (() => void) | null,
};

window.HTMLElement.prototype.animate = vi.fn().mockReturnValue(mockAnimation);

describe("useAnimate", () => {
	const target = ref<HTMLElement | null>(document.createElement("div"));
	const keyframes = [{ opacity: 0 }, { opacity: 1 }];
	const options = { duration: 1000 };

	beforeEach(() => {
		vi.clearAllMocks();
		mockAnimation.onfinish = null;
	});

	it("should not start animation immediately if target is null", () => {
		const nullTarget = ref<HTMLElement | null>(null);
		useAnimate(nullTarget, keyframes, options);
		expect(window.HTMLElement.prototype.animate).not.toHaveBeenCalled();
	});

	it("should start animation immediately by default when target is available", () => {
		useAnimate(target, keyframes, options);
		expect(window.HTMLElement.prototype.animate).toHaveBeenCalledWith(
			keyframes,
			options,
		);
		expect(mockAnimation.play).not.toHaveBeenCalled(); // .animate() auto-plays
	});

	it("should not start immediately if immediate is false", () => {
		useAnimate(target, keyframes, { ...options, immediate: false });
		expect(window.HTMLElement.prototype.animate).not.toHaveBeenCalled();
	});

	it("should play the animation", () => {
		const { play } = useAnimate(target, keyframes, {
			...options,
			immediate: false,
		});
		play();
		expect(window.HTMLElement.prototype.animate).toHaveBeenCalledWith(
			keyframes,
			options,
		);
	});

	it("should update isPlaying and isFinished refs", () => {
		const { isPlaying, isFinished, play } = useAnimate(target, keyframes, {
			...options,
			immediate: false,
		});
		expect(isPlaying.value).toBe(false);
		expect(isFinished.value).toBe(false);

		play();
		expect(isPlaying.value).toBe(true);
		expect(isFinished.value).toBe(false);

		// Simulate finish
		mockAnimation.onfinish?.();
		expect(isPlaying.value).toBe(false);
		expect(isFinished.value).toBe(true);
	});

	it("should call onFinish callback", () => {
		const onFinish = vi.fn();
		useAnimate(target, keyframes, { ...options, onFinish });
		mockAnimation.onfinish?.();
		expect(onFinish).toHaveBeenCalled();
	});

	it("should call pause", () => {
		const { pause } = useAnimate(target, keyframes, options);
		pause();
		expect(mockAnimation.pause).toHaveBeenCalled();
	});

	it("should call reverse", () => {
		const { reverse } = useAnimate(target, keyframes, options);
		reverse();
		expect(mockAnimation.reverse).toHaveBeenCalled();
	});

	it("should call finish", () => {
		const { finish } = useAnimate(target, keyframes, options);
		finish();
		expect(mockAnimation.finish).toHaveBeenCalled();
	});

	it("should call cancel", () => {
		const { cancel } = useAnimate(target, keyframes, options);
		cancel();
		expect(mockAnimation.cancel).toHaveBeenCalled();
	});
});
