import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { useUserMedia } from "./useUserMedia";

describe("useUserMedia", () => {
	const mockGetUserMedia = vi.fn();

	beforeAll(() => {
		Object.defineProperty(navigator, "mediaDevices", {
			value: { getUserMedia: mockGetUserMedia },
			configurable: true,
		});
	});

	afterEach(() => {
		mockGetUserMedia.mockClear();
	});

	it("should be defined", () => {
		expect(useUserMedia).toBeDefined();
	});

	it("should start and stop the stream", async () => {
		const mockStream = { getTracks: () => [{ stop: vi.fn() }] };
		mockGetUserMedia.mockResolvedValue(mockStream);

		const TestComponent = defineComponent({
			template: "<div />",
			setup() {
				const { start, stop, stream } = useUserMedia();
				return { start, stop, stream };
			},
		});

		const wrapper = mount(TestComponent);

		await wrapper.vm.start();
		await nextTick();
		expect(mockGetUserMedia).toHaveBeenCalled();
		expect(wrapper.vm.stream).toBe(mockStream);

		wrapper.vm.stop();
		expect(wrapper.vm.stream).toBeNull();
	});

	it("should handle errors", async () => {
		const testError = new Error("Test error");
		mockGetUserMedia.mockRejectedValue(testError);

		const TestComponent = defineComponent({
			template: "<div />",
			setup() {
				const { start, error } = useUserMedia();
				return { start, error };
			},
		});

		const wrapper = mount(TestComponent);

		await wrapper.vm.start();
		await nextTick();

		expect(wrapper.vm.error).toBe(testError);
	});
});
