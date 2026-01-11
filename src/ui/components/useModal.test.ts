import { beforeEach, describe, expect, it, vi } from "vitest";
import { useModal } from "./useModal";

describe("useModal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(document.body, "style", {
			value: { overflow: "" },
			writable: true,
		});

		// Mock document methods
		vi.spyOn(document, "addEventListener");
		vi.spyOn(document, "removeEventListener");
	});

	it("should initialize with default values", () => {
		const { visible, isOpen } = useModal();

		expect(visible.value).toBe(false);
		expect(isOpen.value).toBe(false);
	});

	it("should initialize with default visible", () => {
		const { visible, isOpen } = useModal({ defaultVisible: true });

		expect(visible.value).toBe(true);
		expect(isOpen.value).toBe(true);
	});

	it("should open modal", async () => {
		const { visible, open } = useModal();

		await open();

		expect(visible.value).toBe(true);
		expect(document.body.style.overflow).toBe("hidden");
	});

	it("should close modal", async () => {
		const { visible, open, close } = useModal();

		await open();
		await close();

		expect(visible.value).toBe(false);
		expect(document.body.style.overflow).toBe("");
	});

	it("should toggle modal", async () => {
		const { visible, toggle } = useModal();

		await toggle();
		expect(visible.value).toBe(true);

		await toggle();
		expect(visible.value).toBe(false);
	});

	it("should handle escape key", async () => {
		const { visible, open } = useModal({ closeOnEscape: true });

		await open();

		const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
		document.dispatchEvent(escapeEvent);

		expect(visible.value).toBe(false);
	});

	it("should handle outside click", async () => {
		const { visible, open, modalRef } = useModal({ closeOnOutsideClick: true });

		// Mock modal element
		const mockModal = {
			contains: vi.fn().mockReturnValue(false),
		};
		modalRef.value = mockModal as any;

		await open();

		const clickEvent = new MouseEvent("click", { bubbles: true });
		Object.defineProperty(clickEvent, "target", { value: document.body });
		document.dispatchEvent(clickEvent);

		expect(visible.value).toBe(false);
	});

	it("should not close on outside click when clicking inside modal", async () => {
		const { visible, open, modalRef } = useModal({ closeOnOutsideClick: true });

		// Mock modal element
		const mockModal = {
			contains: vi.fn().mockReturnValue(true),
		};
		modalRef.value = mockModal as any;

		await open();

		const clickEvent = new MouseEvent("click", { bubbles: true });
		Object.defineProperty(clickEvent, "target", { value: document.body });
		document.dispatchEvent(clickEvent);

		expect(visible.value).toBe(true);
	});

	it("should prevent body scroll when preventBodyScroll is true", async () => {
		const { open } = useModal({ preventBodyScroll: true });

		await open();

		expect(document.body.style.overflow).toBe("hidden");
	});

	it("should not prevent body scroll when preventBodyScroll is false", async () => {
		const { open } = useModal({ preventBodyScroll: false });

		await open();

		expect(document.body.style.overflow).toBe("");
	});
});
