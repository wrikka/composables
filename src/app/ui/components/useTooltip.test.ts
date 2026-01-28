import { describe, it, expect, beforeEach } from "vitest";
import { useTooltip } from "./useTooltip";

describe("useTooltip", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("should initialize with closed state", () => {
		const { isOpen } = useTooltip();

		expect(isOpen.value).toBe(false);
	});

	it("should initialize with open state when defaultOpen is true", () => {
		const { isOpen } = useTooltip({ defaultOpen: true });

		expect(isOpen.value).toBe(true);
	});

	it("should open tooltip", () => {
		const { isOpen, open } = useTooltip();

		expect(isOpen.value).toBe(false);

		open();
		expect(isOpen.value).toBe(true);
	});

	it("should close tooltip", () => {
		const { isOpen, open, close } = useTooltip();

		open();
		expect(isOpen.value).toBe(true);

		close();
		expect(isOpen.value).toBe(false);
	});

	it("should toggle tooltip", () => {
		const { isOpen, toggle } = useTooltip();

		expect(isOpen.value).toBe(false);

		toggle();
		expect(isOpen.value).toBe(true);

		toggle();
		expect(isOpen.value).toBe(false);
	});

	it("should track hovering state", () => {
		const { isHovering, handleMouseEnter, handleMouseLeave } = useTooltip();

		expect(isHovering.value).toBe(false);

		handleMouseEnter();
		expect(isHovering.value).toBe(true);

		handleMouseLeave();
		expect(isHovering.value).toBe(false);
	});

	it("should track focused state", () => {
		const { isFocused, handleFocusIn, handleFocusOut } = useTooltip();

		expect(isFocused.value).toBe(false);

		handleFocusIn();
		expect(isFocused.value).toBe(true);

		handleFocusOut();
		expect(isFocused.value).toBe(false);
	});

	it("should use custom placement", () => {
		const { placement } = useTooltip({ placement: "bottom" });

		expect(placement).toBe("bottom");
	});

	it("should use custom offset", () => {
		const { offset } = useTooltip({ offset: 12 });

		expect(offset).toBe(12);
	});

	it("should set trigger element", () => {
		const { setTrigger } = useTooltip();

		const element = document.createElement("div");
		setTrigger(element);
		expect(element).toBeDefined();
	});
});
