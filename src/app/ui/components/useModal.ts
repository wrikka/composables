import { computed, nextTick, type Ref, ref, watch } from "vue";

export interface UseModalOptions {
	defaultVisible?: boolean;
	closeOnEscape?: boolean;
	closeOnOutsideClick?: boolean;
	preventBodyScroll?: boolean;
	focusTrap?: boolean;
	destroyOnClose?: boolean;
}

export interface UseModalReturn {
	visible: Ref<boolean>;
	isOpen: Ref<boolean>;
	open: () => void;
	close: () => void;
	toggle: () => void;
	closeOnEscape: () => void;
	closeOnOutsideClick: () => void;
}

export function useModal(options: UseModalOptions = {}) {
	const {
		defaultVisible = false,
		closeOnEscape = true,
		closeOnOutsideClick = true,
		preventBodyScroll = true,
		focusTrap = true,
		destroyOnClose: _destroyOnClose = false,
	} = options;

	const visible = ref(defaultVisible);
	const modalRef = ref<HTMLElement | null>(null);
	const triggerRef = ref<HTMLElement | null>(null);

	const isOpen = computed(() => visible.value);

	const open = async () => {
		visible.value = true;

		if (preventBodyScroll) {
			document.body.style.overflow = "hidden";
		}

		await nextTick();

		if (focusTrap && modalRef.value) {
			const focusableElements = modalRef.value.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);
			const firstFocusable = focusableElements[0] as HTMLElement;
			if (firstFocusable) {
				firstFocusable.focus();
			}
		}
	};

	const close = () => {
		visible.value = false;

		if (preventBodyScroll) {
			document.body.style.overflow = "";
		}

		if (triggerRef.value) {
			triggerRef.value.focus();
		}
	};

	const toggle = () => {
		if (visible.value) {
			close();
		} else {
			open();
		}
	};

	const handleEscape = (event: KeyboardEvent) => {
		if (event.key === "Escape" && closeOnEscape && visible.value) {
			close();
		}
	};

	const handleOutsideClick = (event: MouseEvent) => {
		if (closeOnOutsideClick && visible.value && modalRef.value) {
			const target = event.target as HTMLElement;
			if (!modalRef.value.contains(target)) {
				close();
			}
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (!focusTrap || !visible.value || !modalRef.value) return;

		const focusableElements = modalRef.value.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);

		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[
			focusableElements.length - 1
		] as HTMLElement;

		if (event.key === "Tab") {
			if (event.shiftKey) {
				if (document.activeElement === firstElement) {
					event.preventDefault();
					lastElement.focus();
				}
			} else {
				if (document.activeElement === lastElement) {
					event.preventDefault();
					firstElement.focus();
				}
			}
		}
	};

	watch(visible, (newValue: boolean) => {
		if (newValue) {
			document.addEventListener("keydown", handleEscape);
			if (closeOnOutsideClick) {
				document.addEventListener("click", handleOutsideClick);
			}
			if (focusTrap) {
				document.addEventListener("keydown", handleKeydown);
			}
		} else {
			document.removeEventListener("keydown", handleEscape);
			document.removeEventListener("click", handleOutsideClick);
			document.removeEventListener("keydown", handleKeydown);
		}
	});

	return {
		visible,
		isOpen,
		open,
		close,
		toggle,
		modalRef,
		triggerRef,
	};
}
