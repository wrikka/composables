import { describe, it, expect, beforeEach } from "vitest";
import { usePopover } from "./usePopover";

describe("usePopover", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("should initialize with closed state", () => {
		const { isOpen } = usePopover();

		expect(isOpen.value).toBe(false);
	});

	it("should initialize with open state when defaultOpen is true", () => {
		const { isOpen } = usePopover({ defaultOpen: true });

		expect(isOpen.value).toBe(true);
	});

	it("should open popover", () => {
		const { isOpen, open } = usePopover();

		expect(isOpen.value).toBe(false);

		open();
		expect(isOpen.value).toBe(true);
	});

	it("should close popover", () => {
		const { isOpen, open, close } = usePopover();

		open();
		expect(isOpen.value).toBe(true);

		close();
		expect(isOpen.value).toBe(false);
	});

	it("should toggle popover", () => {
		const { isOpen, toggle } = usePopover();

		expect(isOpen.value).toBe(false);

		toggle();
		expect(isOpen.value).toBe(true);

		toggle();
		expect(isOpen.value).toBe(false);
	});

	it("should use custom placement", () => {
		const { placement } = usePopover({ placement: "bottom" });

		expect(placement.value).toBe("bottom");
	});

	it("should use custom offset", () => {
		const { offset } = usePopover({ offset: 12 });

		expect(offset.value).toBe(12);
	});
});
