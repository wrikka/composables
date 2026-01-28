import { describe, it, expect, beforeEach } from "vitest";
import { useDropdown } from "./useDropdown";

describe("useDropdown", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("should initialize with closed state", () => {
		const { isOpen } = useDropdown();

		expect(isOpen.value).toBe(false);
	});

	it("should initialize with open state when defaultOpen is true", () => {
		const { isOpen } = useDropdown({ defaultOpen: true });

		expect(isOpen.value).toBe(true);
	});

	it("should open dropdown", () => {
		const { isOpen, open } = useDropdown();

		expect(isOpen.value).toBe(false);

		open();
		expect(isOpen.value).toBe(true);
	});

	it("should close dropdown", () => {
		const { isOpen, open, close } = useDropdown();

		open();
		expect(isOpen.value).toBe(true);

		close();
		expect(isOpen.value).toBe(false);
	});

	it("should toggle dropdown", () => {
		const { isOpen, toggle } = useDropdown();

		expect(isOpen.value).toBe(false);

		toggle();
		expect(isOpen.value).toBe(true);

		toggle();
		expect(isOpen.value).toBe(false);
	});

	it("should handle keyboard escape to close", () => {
		const { isOpen, open, handleKeyDown } = useDropdown({ closeOnEsc: true });

		open();
		expect(isOpen.value).toBe(true);

		const event = new KeyboardEvent("keydown", { key: "Escape" });
		handleKeyDown(event);
		expect(isOpen.value).toBe(false);
	});

	it("should not close on escape when closeOnEsc is false", () => {
		const { isOpen, open, handleKeyDown } = useDropdown({ closeOnEsc: false });

		open();
		expect(isOpen.value).toBe(true);

		const event = new KeyboardEvent("keydown", { key: "Escape" });
		handleKeyDown(event);
		expect(isOpen.value).toBe(true);
	});
});
