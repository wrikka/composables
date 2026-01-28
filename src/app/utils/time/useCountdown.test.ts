import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { useCountdown } from "./useCountdown";

describe("useCountdown", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const createComponent = (seconds: number, options: any) => {
		return mount(
			defineComponent({
				setup() {
					return useCountdown(seconds, options);
				},
				template: "<div></div>",
			}),
		);
	};

	it("should start countdown immediately by default", () => {
		const wrapper = createComponent(5, {});
		expect(wrapper.vm.isActive).toBe(true);
		expect(wrapper.vm.remaining).toBe(5);
	});

	it("should not start countdown immediately when immediate is false", () => {
		const wrapper = createComponent(5, { immediate: false });
		expect(wrapper.vm.isActive).toBe(false);
		expect(wrapper.vm.remaining).toBe(5);
	});

	it("should decrease remaining time every second", () => {
		const wrapper = createComponent(5, { interval: 1000 });
		expect(wrapper.vm.remaining).toBe(5);

		vi.advanceTimersByTime(1000);
		expect(wrapper.vm.remaining).toBe(4);

		vi.advanceTimersByTime(2000);
		expect(wrapper.vm.remaining).toBe(2);
	});

	it("should call onTick on every tick", () => {
		const onTick = vi.fn();
		createComponent(3, { onTick, interval: 1000 });

		vi.advanceTimersByTime(1000);
		expect(onTick).toHaveBeenCalledWith(2);

		vi.advanceTimersByTime(1000);
		expect(onTick).toHaveBeenCalledWith(1);
	});

	it("should call onComplete when countdown finishes", () => {
		const onComplete = vi.fn();
		createComponent(2, { onComplete, interval: 1000 });

		vi.advanceTimersByTime(2000);
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it("should pause and resume the countdown", () => {
		const wrapper = createComponent(5, { interval: 1000 });
		vi.advanceTimersByTime(2000);
		expect(wrapper.vm.remaining).toBe(3);

		wrapper.vm.pause();
		expect(wrapper.vm.isActive).toBe(false);

		vi.advanceTimersByTime(2000);
		expect(wrapper.vm.remaining).toBe(3); // Should not change

		wrapper.vm.resume();
		expect(wrapper.vm.isActive).toBe(true);

		vi.advanceTimersByTime(1000);
		expect(wrapper.vm.remaining).toBe(2);
	});

	it("should reset the countdown", () => {
		const wrapper = createComponent(5, { interval: 1000 });
		vi.advanceTimersByTime(3000);
		expect(wrapper.vm.remaining).toBe(2);

		wrapper.vm.reset();
		expect(wrapper.vm.isActive).toBe(false);
		expect(wrapper.vm.remaining).toBe(5);
	});

	it("should reset the countdown with a new value", () => {
		const wrapper = createComponent(5, { interval: 1000 });
		vi.advanceTimersByTime(3000);

		wrapper.vm.reset(10);
		expect(wrapper.vm.isActive).toBe(false);
		expect(wrapper.vm.remaining).toBe(10);
	});

	it("should restart the countdown", () => {
		const wrapper = createComponent(5, { interval: 1000 });
		vi.advanceTimersByTime(3000);
		expect(wrapper.vm.remaining).toBe(2);

		wrapper.vm.restart();
		expect(wrapper.vm.isActive).toBe(true);
		expect(wrapper.vm.remaining).toBe(5);

		vi.advanceTimersByTime(1000);
		expect(wrapper.vm.remaining).toBe(4);
	});

	it("should clean up interval on unmount", () => {
		const clearIntervalSpy = vi.spyOn(global, "clearInterval");
		const wrapper = createComponent(5, {});
		wrapper.unmount();
		expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
	});
});
