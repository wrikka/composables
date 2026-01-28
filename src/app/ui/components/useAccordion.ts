import { ref } from "vue";

export function useAccordion<T>(items: T[], keyFn?: (item: T) => string) {
  const openItems = ref<Set<string>>(new Set());
  const activeItem = ref<T | null>(null);

  const isOpen = (item: T): boolean => {
    const key = keyFn ? keyFn(item) : String(items.indexOf(item));
    return openItems.value.has(key);
  };

  const isActive = (item: T): boolean => {
    return activeItem.value === item;
  };

  function toggle(item: T) {
    const key = keyFn ? keyFn(item) : String(items.indexOf(item));

    if (openItems.value.has(key)) {
      openItems.value.delete(key);
      if (isActive(item)) {
        activeItem.value = null;
      }
    } else {
      openItems.value.add(key);
      activeItem.value = item;
    }
  }

  function open(item: T) {
    const key = keyFn ? keyFn(item) : String(items.indexOf(item));
    openItems.value.add(key);
    activeItem.value = item;
  }

  function close(item: T) {
    const key = keyFn ? keyFn(item) : String(items.indexOf(item));
    openItems.value.delete(key);
    if (isActive(item)) {
      activeItem.value = null;
    }
  }

  function closeAll() {
    openItems.value.clear();
    activeItem.value = null;
  }

  function openAll() {
    items.forEach(item => {
      const key = keyFn ? keyFn(item) : String(items.indexOf(item));
      openItems.value.add(key);
    });
  }

  function isOpenAll(): boolean {
    return openItems.value.size === items.length;
  }

  return {
    openItems,
    activeItem,
    isOpen,
    isActive,
    toggle,
    open,
    close,
    closeAll,
    openAll,
    isOpenAll,
  };
}
