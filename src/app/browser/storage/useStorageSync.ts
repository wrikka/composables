import { onMounted, onUnmounted, ref, watch } from 'vue';

export interface UseStorageSyncOptions<T> {
  storage?: Storage;
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
  deep?: boolean;
}

export function useStorageSync<T>(
  key: string,
  initialValue: T,
  options: UseStorageSyncOptions<T> = {},
) {
  const { storage = localStorage, deep = false } = options;

  const data = ref<T>(initialValue);
  const error = ref<Error | null>(null);

  const serializer = options.serializer || {
    read: (v: string) => {
      try {
        return JSON.parse(v);
      }
      catch {
        return v as T;
      }
    },
    write: (v: T) => JSON.stringify(v),
  };

  function read() {
    try {
      const value = storage.getItem(key);
      if (value !== null) {
        data.value = serializer.read(value);
      }
    }
    catch (e) {
      error.value = e as Error;
    }
  }

  function write(value: T) {
    try {
      const serialized = serializer.write(value);
      storage.setItem(key, serialized);
    }
    catch (e) {
      error.value = e as Error;
    }
  }

  function handleStorageChange(event: StorageEvent) {
    if (event.key === key && event.newValue !== null) {
      data.value = serializer.read(event.newValue);
    }
  }

  watch(
    data,
    (newValue) => {
      write(newValue);
    },
    { deep },
  );

  onMounted(() => {
    read();
    window.addEventListener('storage', handleStorageChange);
  });

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange);
  });

  return {
    data,
    error,
    read,
    write,
  };
}
