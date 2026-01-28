import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { useMemory } from "./useMemory";

describe("useMemory", () => {
	it("should be defined", () => {
		expect(useMemory).toBeDefined();
	});

	it("should return memory info if available", async () => {
		// Mock performance.memory
		(performance as any).memory = {
			jsHeapSizeLimit: 2190000000,
			totalJSHeapSize: 10000000,
			usedJSHeapSize: 5000000,
		};

		const TestComponent = defineComponent({
			template: "<div>{{ memory?.usedJSHeapSize }}</div>",
			setup() {
				const { memory } = useMemory();
				return { memory };
			},
		});

		const wrapper = mount(TestComponent);

		// Wait for interval
		await new Promise((resolve) => setTimeout(resolve, 1100));

		expect(wrapper.text()).toContain("5000000");

		delete (performance as any).memory;
	});

	it("should return null if not available", async () => {
		const TestComponent = defineComponent({
			template: "<div>{{ memory === null }}</div>",
			setup() {
				const { memory } = useMemory();
				return { memory };
			},
		});

		const wrapper = mount(TestComponent);
		await new Promise((resolve) => setTimeout(resolve, 1100));
		expect(wrapper.text()).toBe("true");
	});
});
