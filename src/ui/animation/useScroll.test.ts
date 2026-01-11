import { afterAll, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useScroll } from "./useScroll";

vi.useFakeTimers();

describe("useScroll", () => {
	const mockElement = document.createElement("div");
	const addEventListener = vi.spyOn(mockElement, "addEventListener");

	Object.defineProperties(mockElement, {
		scrollLeft: { writable: true, value: 0 },
		scrollTop: { writable: true, value: 0 },
		clientWidth: { writable: true, value: 100 },
		clientHeight: { writable: true, value: 100 },
		scrollWidth: { writable: true, value: 200 },
		scrollHeight: { writable: true, value: 200 },
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should add scroll event listener on mount", async () => {
		const target = ref<HTMLElement | null>(null);
		useScroll(target);
		target.value = mockElement;
		await nextTick();
		expect(addEventListener).toHaveBeenCalledWith(
			"scroll",
			expect.any(Function),
			{ passive: true },
		);
	});

	it("should update x and y on scroll", () => {
		const target = ref(mockElement);
		const { x, y } = useScroll(target);

		mockElement.scrollLeft = 50;
		mockElement.scrollTop = 50;
		mockElement.dispatchEvent(new Event("scroll"));

		expect(x.value).toBe(50);
		expect(y.value).toBe(50);
	});

	it("should update isScrolling state", () => {
		const target = ref(mockElement);
		const { isScrolling } = useScroll(target);

		mockElement.dispatchEvent(new Event("scroll"));
		expect(isScrolling.value).toBe(true);

		vi.runAllTimers();
		expect(isScrolling.value).toBe(false);
	});

	it("should update arrivedState correctly", () => {
		const target = ref(mockElement);
		const { arrivedState } = useScroll(target);

		// Initial state
		mockElement.scrollLeft = 0;
		mockElement.scrollTop = 0;
		mockElement.dispatchEvent(new Event("scroll"));
		expect(arrivedState.left.value).toBe(true);
		expect(arrivedState.top.value).toBe(true);
		expect(arrivedState.right.value).toBe(false);
		expect(arrivedState.bottom.value).toBe(false);

		// Scrolled to bottom right
		mockElement.scrollLeft = 100;
		mockElement.scrollTop = 100;
		mockElement.dispatchEvent(new Event("scroll"));
		expect(arrivedState.left.value).toBe(false);
		expect(arrivedState.top.value).toBe(false);
		expect(arrivedState.right.value).toBe(true);
		expect(arrivedState.bottom.value).toBe(true);
	});
});
