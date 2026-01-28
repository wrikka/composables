import { onMounted, onUnmounted, ref } from 'vue';

export interface UseStorageWatcherOptions {
  storage?: Storage;
  deep?: boolean;
}

export function useStorageWatcher(key: string, options: UseStorageWatcherOptions = {}) {
  const { storage = localStorage } = options;

  const value = ref<string | null>(storage.getItem(key));
  const error = ref<Error | null>(null);

  function handleStorageChange(event: StorageEvent) {
    if (event.key === key) {
      value.value = event.newValue;
    }
  }

  function read() {
    try {
      value.value = storage.getItem(key);
    }
    catch (e) {
      error.value = e as Error;
    }
  }

  onMounted(() => {
    window.addEventListener('storage', handleStorageChange);
    read();
  });

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange);
  });

  return {
    value,
    error,
    read,
  };
}
