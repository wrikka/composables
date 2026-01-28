import { ref, onMounted, onUnmounted } from 'vue';

export interface UseTooltipOptions {
  defaultOpen?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  offset?: number;
  delay?: number;
  closeOnHover?: boolean;
  closeOnClick?: boolean;
  closeOnFocusOut?: boolean;
  trigger?: HTMLElement | null;
}

export function useTooltip(options: UseTooltipOptions = {}) {
  const isOpen = ref(options.defaultOpen || false);
  const isHovering = ref(false);
  const isFocused = ref(false);

  let {
    placement = 'top',
    offset = 8,
    delay = 0,
    closeOnHover = false,
    closeOnClick = true,
    closeOnFocusOut = false,
    trigger = null,
  } = options;

  let hoverTimer: any = null;
  let focusTimer: any = null;

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

  function handleMouseEnter() {
    isHovering.value = true;
    if (delay > 0 && !isOpen.value) {
      hoverTimer = setTimeout(() => {
        open();
      }, delay);
    }
    else if (closeOnHover && isOpen.value) {
      clearTimeout(hoverTimer);
    }
  }

  function handleMouseLeave() {
    isHovering.value = false;
    clearTimeout(hoverTimer);

    if (closeOnHover && isOpen.value) {
      close();
    }
  }

  function handleFocusIn() {
    isFocused.value = true;
    if (delay > 0 && !isOpen.value) {
      focusTimer = setTimeout(() => {
        open();
      }, delay);
    }
    else if (closeOnFocusOut && isOpen.value) {
      clearTimeout(focusTimer);
    }
  }

  function handleFocusOut() {
    isFocused.value = false;
    clearTimeout(focusTimer);

    if (closeOnFocusOut && isOpen.value) {
      close();
    }
  }

  function handleClick() {
    if (closeOnClick) {
      close();
    }
  }

  function setTrigger(element: HTMLElement) {
    trigger = element;
  }

  onMounted(() => {
    if (trigger) {
      trigger.addEventListener('mouseenter', handleMouseEnter);
      trigger.addEventListener('mouseleave', handleMouseLeave);
      trigger.addEventListener('focusin', handleFocusIn);
      trigger.addEventListener('focusout', handleFocusOut);
      trigger.addEventListener('click', handleClick);
    }
  });

  onUnmounted(() => {
    if (trigger) {
      trigger.removeEventListener('mouseenter', handleMouseEnter);
      trigger.removeEventListener('mouseleave', handleMouseLeave);
      trigger.removeEventListener('focusin', handleFocusIn);
      trigger.removeEventListener('focusout', handleFocusOut);
      trigger.removeEventListener('click', handleClick);
    }

    clearTimeout(hoverTimer);
    clearTimeout(focusTimer);
  });

  return {
    isOpen,
    isHovering,
    isFocused,
    placement,
    offset,
    open,
    close,
    toggle,
    handleMouseEnter,
    handleMouseLeave,
    handleFocusIn,
    handleFocusOut,
    handleClick,
    setTrigger,
  };
}
