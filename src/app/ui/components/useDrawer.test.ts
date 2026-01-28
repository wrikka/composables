import { describe, it, expect } from "vitest";
import { useDrawer } from "./useDrawer";

describe("useDrawer", () => {
	it("should initialize with closed state", () => {
		const { isOpen } = useDrawer();

		expect(isOpen.value).toBe(false);
	});

	it("should initialize with open state when defaultOpen is true", () => {
		const { isOpen } = useDrawer({ defaultOpen: true });

		expect(isOpen.value).toBe(true);
	});

	it("should open drawer", () => {
		const { isOpen, open } = useDrawer();

		expect(isOpen.value).toBe(false);

		open();
		expect(isOpen.value).toBe(true);
	});

	it("should close drawer", () => {
		const { isOpen, open, close } = useDrawer();

		open();
		expect(isOpen.value).toBe(true);

		close();
		expect(isOpen.value).toBe(false);
	});

	it("should toggle drawer", () => {
		const { isOpen, toggle } = useDrawer();

		expect(isOpen.value).toBe(false);

		toggle();
		expect(isOpen.value).toBe(true);

		toggle();
		expect(isOpen.value).toBe(false);
	});

	it("should track closing state", () => {
		const { isClosing, open, close } = useDrawer();

		open();
		expect(isClosing.value).toBe(false);

		close();
		expect(isClosing.value).toBe(true);
	});

	it("should handle keyboard escape to close", () => {
		const { isOpen, open, handleKeyDown } = useDrawer({ closeOnEsc: true });

		open();
		expect(isOpen.value).toBe(true);

		const event = new KeyboardEvent("keydown", { key: "Escape" });
		handleKeyDown(event);
		expect(isOpen.value).toBe(false);
	});

	it("should not close on escape when closeOnEsc is false", () => {
		const { isOpen, open, handleKeyDown } = useDrawer({ closeOnEsc: false });

		open();
		expect(isOpen.value).toBe(true);

		const event = new KeyboardEvent("keydown", { key: "Escape" });
		handleKeyDown(event);
		expect(isOpen.value).toBe(true);
	});

	it("should use custom position", () => {
		const { position } = useDrawer({ position: "left" });

		expect(position.value).toBe("left");
	});

	it("should use custom size", () => {
		const { size } = useDrawer({ size: "600px" });

		expect(size.value).toBe("600px");
	});
});
