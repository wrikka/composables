import { ref, onMounted, onUnmounted } from 'vue';

export interface UseDropdownOptions {
  defaultOpen?: boolean;
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
  trigger?: HTMLElement | null;
}

export function useDropdown(options: UseDropdownOptions = {}) {
  const isOpen = ref(options.defaultOpen || false);
  const triggerElement = ref<HTMLElement | null>(options.trigger || null);

  const {
    closeOnEsc = true,
    closeOnOutsideClick = true,
  } = options;

  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  function toggle() {
    if (isOpen.value) {
      close();
    }
    else {
      open();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (closeOnEsc && e.key === 'Escape') {
      close();
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (closeOnOutsideClick && isOpen.value) {
      if (triggerElement.value && !triggerElement.value.contains(e.target as Node)) {
        close();
      }
    }
  }

  function setTrigger(element: HTMLElement) {
    triggerElement.value = element;
  }

  onMounted(() => {
    if (closeOnOutsideClick) {
      document.addEventListener('click', handleClickOutside);
    }
  });

  onUnmounted(() => {
    if (closeOnOutsideClick) {
      document.removeEventListener('click', handleClickOutside);
    }
  });

  return {
    isOpen,
    triggerElement,
    open,
    close,
    toggle,
    handleKeyDown,
    setTrigger,
  };
}
