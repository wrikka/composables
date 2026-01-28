import { onMounted, onUnmounted, ref, Ref } from 'vue';

export function useFocusTrap(
  container: Ref<HTMLElement | null> | HTMLElement | null,
  options: {
    autoFocus?: boolean;
    restoreFocus?: boolean;
  } = {},
) {
  const { autoFocus = true, restoreFocus = true } = options;
  const previouslyFocusedElement = ref<HTMLElement | null>(null);
  const isTrapped = ref(false);

  function getFocusableElements(element: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(element.querySelectorAll(focusableSelectors.join(','))) as HTMLElement[];
  }

  function trapFocus(e: KeyboardEvent) {
    if (e.key !== 'Tab') {
      return;
    }

    const containerElement = container && 'value' in container ? container.value : container;
    if (!containerElement) {
      return;
    }

    const focusableElements = getFocusableElements(containerElement);
    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement && lastElement) {
        e.preventDefault();
        lastElement.focus();
      }
    }
    else {
      if (document.activeElement === lastElement && firstElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  function activate() {
    const containerElement = container && 'value' in container ? container.value : container;
    if (!containerElement) {
      return;
    }

    previouslyFocusedElement.value = document.activeElement as HTMLElement;
    isTrapped.value = true;

    if (autoFocus) {
      const focusableElements = getFocusableElements(containerElement);
      if (focusableElements.length > 0 && focusableElements[0]) {
        focusableElements[0].focus();
      }
    }

    document.addEventListener('keydown', trapFocus);
  }

  function deactivate() {
    isTrapped.value = false;
    document.removeEventListener('keydown', trapFocus);

    if (restoreFocus && previouslyFocusedElement.value) {
      previouslyFocusedElement.value.focus();
    }
  }

  onMounted(() => {
    activate();
  });

  onUnmounted(() => {
    deactivate();
  });

  return {
    isTrapped,
    activate,
    deactivate,
  };
}
