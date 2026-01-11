import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useFocus } from "./useFocus";

describe("useFocus", () => {
	it("should track focus state", async () => {
		const target = ref<HTMLInputElement | null>(null);

		const wrapper = mount({
			template: '<input ref="target" />',
			setup() {
				const { isFocused } = useFocus(target);
				return { isFocused, target };
			},
		});

		expect(wrapper.vm.isFocused).toBe(false);

		await wrapper.find("input").trigger("focus");
		expect(wrapper.vm.isFocused).toBe(true);

		await wrapper.find("input").trigger("blur");
		expect(wrapper.vm.isFocused).toBe(false);
	});
});
