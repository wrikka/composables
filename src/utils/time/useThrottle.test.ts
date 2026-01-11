import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, type Ref, ref } from "vue";
import { useThrottle } from "./useThrottle";

describe("useThrottle", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const createComponent = (
		sourceRef: Ref<any>,
		callback: (value: any) => void,
		options: any,
	) => {
		return mount(
			defineComponent({
				setup() {
					return useThrottle(sourceRef, callback, options);
				},
				template: "<div></div>",
			}),
		);
	};

	it("should throttle the callback with default options (leading=true, trailing=true)", () => {
		const source = ref(0);
		const callback = vi.fn();
		createComponent(source, callback, { delay: 500 });

		// Leading call
		source.value = 1;
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(1);

		// Throttled calls
		source.value = 2;
		source.value = 3;
		expect(callback).toHaveBeenCalledTimes(1);

		// Trailing call
		vi.advanceTimersByTime(500);
		expect(callback).toHaveBeenCalledTimes(2);
		expect(callback).toHaveBeenCalledWith(3);
	});

	it("should only call on leading edge when trailing is false", () => {
		const source = ref(0);
		const callback = vi.fn();
		createComponent(source, callback, {
			delay: 500,
			leading: true,
			trailing: false,
		});

		source.value = 1;
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(1);

		source.value = 2;
		vi.advanceTimersByTime(500);
		expect(callback).toHaveBeenCalledTimes(1); // No trailing call
	});

	it("should only call on trailing edge when leading is false", () => {
		const source = ref(0);
		const callback = vi.fn();
		createComponent(source, callback, {
			delay: 500,
			leading: false,
			trailing: true,
		});

		source.value = 1;
		expect(callback).not.toHaveBeenCalled();

		vi.advanceTimersByTime(500);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(1);
	});

	it("should not call if leading and trailing are false", () => {
		const source = ref(0);
		const callback = vi.fn();
		createComponent(source, callback, {
			delay: 500,
			leading: false,
			trailing: false,
		});

		source.value = 1;
		vi.advanceTimersByTime(500);

		expect(callback).not.toHaveBeenCalled();
	});

	it("should flush pending calls", () => {
		const source = ref(0);
		const callback = vi.fn();
		const wrapper = createComponent(source, callback, {
			delay: 500,
			leading: false,
		});

		source.value = 1;
		expect(callback).not.toHaveBeenCalled();

		wrapper.vm.flush();

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(1);
	});

	it("should cancel pending calls", () => {
		const source = ref(0);
		const callback = vi.fn();
		const wrapper = createComponent(source, callback, {
			delay: 500,
			leading: false,
		});

		source.value = 1;
		wrapper.vm.cancel();
		vi.advanceTimersByTime(500);

		expect(callback).not.toHaveBeenCalled();
	});

	it("should update throttledValue", () => {
		const source = ref("initial");
		const callback = vi.fn();
		const wrapper = createComponent(source, callback, { delay: 500 });

		expect(wrapper.vm.throttledValue).toBe("initial");

		source.value = "updated";
		vi.advanceTimersByTime(500);

		expect(wrapper.vm.throttledValue).toBe("updated");
	});

	it("should clean up timers on unmount", () => {
		const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
		const source = ref(0);
		const callback = vi.fn();
		const wrapper = createComponent(source, callback, { delay: 500 });

		source.value = 1;
		wrapper.unmount();

		expect(clearTimeoutSpy).toHaveBeenCalled();
	});
});
