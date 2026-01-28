import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useInfiniteScroll } from "./useInfiniteScroll";

// A simple async sleep function for testing promises
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("useInfiniteScroll", () => {
	let target: any;
	let onLoad: any;

	beforeEach(() => {
		target = ref({
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			scrollTop: 0,
			scrollHeight: 1000,
			clientHeight: 500,
		});
		onLoad = vi.fn().mockResolvedValue(undefined);
	});

	it("should not load initially", () => {
		useInfiniteScroll({ target, onLoad });
		expect(onLoad).not.toHaveBeenCalled();
	});

	it("should load when scrolled to the bottom", async () => {
		const { isLoading } = useInfiniteScroll({ target, onLoad, distance: 100 });

		// Simulate scroll to the bottom
		target.value.scrollTop = 400; // 1000 (scrollHeight) - 500 (clientHeight) - 100 (distance)
		const handleScroll = target.value.addEventListener.mock.calls[0][1];
		handleScroll();

		expect(isLoading.value).toBe(true);
		expect(onLoad).toHaveBeenCalledOnce();
		await sleep(1); // Wait for promise to resolve
		expect(isLoading.value).toBe(false);
	});

	it("should not load if already loading", () => {
		const { isLoading } = useInfiniteScroll({ target, onLoad });
		isLoading.value = true;

		target.value.scrollTop = 450;
		const handleScroll = target.value.addEventListener.mock.calls[0][1];
		handleScroll();

		expect(onLoad).not.toHaveBeenCalled();
	});

	it("should not load if hasMore is false", () => {
		const { hasMore } = useInfiniteScroll({ target, onLoad });
		hasMore.value = false;

		target.value.scrollTop = 450;
		const handleScroll = target.value.addEventListener.mock.calls[0][1];
		handleScroll();

		expect(onLoad).not.toHaveBeenCalled();
	});

	it("should add and remove scroll event listener", () => {
		const { unmount } = (global as any).createComponent(() => {
			useInfiniteScroll({ target, onLoad });
			return () => null;
		});

		expect(target.value.addEventListener).toHaveBeenCalledWith(
			"scroll",
			expect.any(Function),
		);
		unmount();
		expect(target.value.removeEventListener).toHaveBeenCalledWith(
			"scroll",
			expect.any(Function),
		);
	});
});
