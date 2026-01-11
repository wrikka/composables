import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { useOnline } from "./useOnline";

describe("useOnline", () => {
	it("should be defined", () => {
		expect(useOnline).toBeDefined();
	});

	it("should return the initial online status", () => {
		const TestComponent = defineComponent({
			template: "<div></div>",
			setup() {
				const { isOnline } = useOnline();
				expect(typeof isOnline.value).toBe("boolean");
				return { isOnline };
			},
		});

		const wrapper = mount(TestComponent);
		expect(wrapper).toBeDefined();
	});

	it("should update status on online/offline events", async () => {
		const TestComponent = defineComponent({
			template: "<div>{{ isOnline }}</div>",
			setup() {
				const { isOnline } = useOnline();
				return { isOnline };
			},
		});

		const wrapper = mount(TestComponent);

		// Simulate offline event
		Object.defineProperty(navigator, "onLine", {
			value: false,
			configurable: true,
		});
		window.dispatchEvent(new Event("offline"));
		await wrapper.vm.$nextTick();
		expect(wrapper.text()).toBe("false");

		// Simulate online event
		Object.defineProperty(navigator, "onLine", {
			value: true,
			configurable: true,
		});
		window.dispatchEvent(new Event("online"));
		await wrapper.vm.$nextTick();
		expect(wrapper.text()).toBe("true");
	});
});
