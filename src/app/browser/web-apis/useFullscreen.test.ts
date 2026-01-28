import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { useFullscreen, usePictureInPicture } from "./useFullscreen";

// Helper to create a mounted component for testing composables
const createComponent = (composable: () => any) => {
	return mount(
		defineComponent({
			setup() {
				return composable();
			},
			template: "<div></div>",
		}),
	);
};

describe("useFullscreen", () => {
	beforeEach(() => {
		vi.spyOn(document.documentElement, "requestFullscreen").mockResolvedValue(
			undefined,
		);
		vi.spyOn(document, "exitFullscreen").mockResolvedValue(undefined);
		vi.spyOn(document, "addEventListener");
		vi.spyOn(document, "removeEventListener");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should initialize with default values", () => {
		const wrapper = createComponent(() => useFullscreen());
		expect((wrapper.vm as any).isSupported).toBe(true);
		expect((wrapper.vm as any).isActive).toBe(false);
		expect((wrapper.vm as any).element).toBe(null);
		expect((wrapper.vm as any).error).toBe(null);
	});

	it("should handle unsupported browser", () => {
		vi.spyOn(document, "fullscreenEnabled", "get").mockReturnValue(false);
		const wrapper = createComponent(() => useFullscreen());
		expect((wrapper.vm as any).isSupported).toBe(false);
	});

	it("should request fullscreen successfully", async () => {
		const wrapper = createComponent(() => useFullscreen());
		await (wrapper.vm as any).requestFullscreen();
		expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
	});

	it("should exit fullscreen successfully", async () => {
		vi.spyOn(document, "fullscreenElement", "get").mockReturnValue(
			document.documentElement,
		);
		const wrapper = createComponent(() => useFullscreen());
		(wrapper.vm as any).isActive = true; // Manually set for test simplicity

		await (wrapper.vm as any).exitFullscreen();
		expect(document.exitFullscreen).toHaveBeenCalled();
	});
});

describe("usePictureInPicture", () => {
	let mockVideo: any;

	beforeEach(() => {
		mockVideo = {
			requestPictureInPicture: vi.fn().mockResolvedValue(undefined),
		};
		vi.spyOn(document, "exitPictureInPicture").mockResolvedValue(undefined);
		vi.spyOn(document, "addEventListener");
		vi.spyOn(document, "removeEventListener");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should initialize with default values", () => {
		vi.spyOn(document, "pictureInPictureEnabled", "get").mockReturnValue(true);
		const wrapper = createComponent(() => usePictureInPicture());
		expect((wrapper.vm as any).isSupported).toBe(true);
		expect((wrapper.vm as any).isActive).toBe(false);
		expect((wrapper.vm as any).video).toBe(null);
		expect((wrapper.vm as any).error).toBe(null);
	});

	it("should handle unsupported PiP", () => {
		vi.spyOn(document, "pictureInPictureEnabled", "get").mockReturnValue(false);
		const wrapper = createComponent(() => usePictureInPicture());
		expect((wrapper.vm as any).isSupported).toBe(false);
	});

	it("should request PiP successfully", async () => {
		vi.spyOn(document, "pictureInPictureEnabled", "get").mockReturnValue(true);
		const wrapper = createComponent(() => usePictureInPicture());
		await (wrapper.vm as any).requestPiP(mockVideo);
		expect(mockVideo.requestPictureInPicture).toHaveBeenCalled();
		expect((wrapper.vm as any).isActive).toBe(true);
		expect((wrapper.vm as any).video).toBe(mockVideo);
	});

	it("should exit PiP successfully", async () => {
		vi.spyOn(document, "pictureInPictureElement", "get").mockReturnValue(
			mockVideo,
		);
		const wrapper = createComponent(() => usePictureInPicture());
		(wrapper.vm as any).isActive = true; // Manually set for test simplicity

		await (wrapper.vm as any).exitPiP();
		expect(document.exitPictureInPicture).toHaveBeenCalled();
	});
});
