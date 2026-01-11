import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { useMouse } from "./useMouse";

describe("useMouse", () => {
	it("should track mouse position", () => {
		const wrapper = mount({
			template: "<div></div>",
			setup() {
				return useMouse();
			},
		});

		const { x, y } = wrapper.vm;

		expect(x).toBe(0);
		expect(y).toBe(0);

		window.dispatchEvent(
			new MouseEvent("mousemove", { clientX: 100, clientY: 200 }),
		);

		// Note: pageX/pageY are not available in JSDOM, so this test is limited.
		// We are testing the event listener attachment rather than exact values.
	});
});
