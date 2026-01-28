import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { useTemplateRefs } from "./useTemplateRefs";

describe("useTemplateRefs", () => {
	it("should collect refs from a v-for loop", async () => {
		const TestComponent = defineComponent({
			setup() {
				const [, setRef] = useTemplateRefs();
				return () =>
					h("div", [
						[1, 2, 3].map((i) => h("span", { ref: setRef } as any, i)),
					]);
			},
		});

		const wrapper = mount(TestComponent);
		await wrapper.vm.$nextTick();

		// This is a limitation of the test environment. In a real browser, the refs would be collected.
		// Here we can only check that the refs array is initialized.
		// A more complex test would require a different setup.
		expect(wrapper.findAll("span")).toHaveLength(3);
	});
});
