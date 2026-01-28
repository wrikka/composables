import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useEventListener } from "./useEventListener";

describe("useEventListener", () => {
	it("should add and remove event listener", () => {
		const target = ref(document.createElement("div"));
		const listener = vi.fn();

		const wrapper = mount({
			template: "<div></div>",
			setup() {
				useEventListener(target, "click", listener);
				return {};
			},
		});

		target.value.dispatchEvent(new MouseEvent("click"));
		expect(listener).toHaveBeenCalledTimes(1);

		wrapper.unmount();

		target.value.dispatchEvent(new MouseEvent("click"));
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("should work with window", () => {
		const listener = vi.fn();

		const wrapper = mount({
			template: "<div></div>",
			setup() {
				useEventListener(window, "click", listener);
				return {};
			},
		});

		window.dispatchEvent(new MouseEvent("click"));
		expect(listener).toHaveBeenCalledTimes(1);

		wrapper.unmount();

		window.dispatchEvent(new MouseEvent("click"));
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
