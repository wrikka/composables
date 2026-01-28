import { ref, computed } from 'vue';

export interface UseDrawerOptions {
  defaultOpen?: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: string | number;
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
}

export function useDrawer(options: UseDrawerOptions = {}) {
  const isOpen = ref(options.defaultOpen || false);
  const isClosing = ref(false);

  const {
    position = 'right',
    size = '400px',
    closeOnEsc = true,
  } = options;

  function open() {
    isOpen.value = true;
    isClosing.value = false;
  }

  function close() {
    isClosing.value = true;
    setTimeout(() => {
      isOpen.value = false;
      isClosing.value = false;
    }, 200);
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

  const isVisible = computed(() => isOpen.value && !isClosing.value);

  return {
    isOpen,
    isClosing,
    isVisible,
    position,
    size,
    open,
    close,
    toggle,
    handleKeyDown,
  };
}
