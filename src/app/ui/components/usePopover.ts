import { ref, onMounted, onUnmounted } from 'vue';

export interface UsePopoverOptions {
  defaultOpen?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  offset?: number;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  trigger?: HTMLElement | null;
}

export function usePopover(options: UsePopoverOptions = {}) {
  const isOpen = ref(options.defaultOpen || false);
  const triggerElement = ref<HTMLElement | null>(options.trigger || null);

  const {
    placement = 'top',
    offset = 8,
    closeOnClickOutside = true,
    closeOnEsc = true,
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

  function handleClickOutside(e: MouseEvent) {
    if (closeOnClickOutside && isOpen.value) {
      if (triggerElement.value && !triggerElement.value.contains(e.target as Node)) {
        close();
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (closeOnEsc && e.key === 'Escape') {
      close();
    }
  }

  function setTrigger(element: HTMLElement) {
    triggerElement.value = element;
  }

  onMounted(() => {
    if (closeOnClickOutside) {
      document.addEventListener('click', handleClickOutside);
    }
  });

  onUnmounted(() => {
    if (closeOnClickOutside) {
      document.removeEventListener('click', handleClickOutside);
    }
  });

  return {
    isOpen,
    triggerElement,
    placement,
    offset,
    open,
    close,
    toggle,
    handleClickOutside,
    handleKeyDown,
    setTrigger,
  };
}
