import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useElementVisibility } from "./useElementVisibility";

// Mock IntersectionObserver
const observe = vi.fn();
const unobserve = vi.fn();
const disconnect = vi.fn();

vi.stubGlobal(
	"IntersectionObserver",
	vi.fn(() => ({
		observe,
		unobserve,
		disconnect,
	})),
);

describe("useElementVisibility", () => {
	it("should observe the element on mount", () => {
		const el = ref(document.createElement("div"));
		mount({
			template: "<div></div>",
			setup() {
				useElementVisibility(el);
				return {};
			},
		});

		expect(observe).toHaveBeenCalledWith(el.value);
	});

	it("should disconnect the observer on unmount", () => {
		const el = ref(document.createElement("div"));
		const wrapper = mount({
			template: "<div></div>",
			setup() {
				useElementVisibility(el);
				return {};
			},
		});

		wrapper.unmount();
		expect(disconnect).toHaveBeenCalled();
	});
});
