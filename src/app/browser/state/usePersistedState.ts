import { ref, watch, onMounted } from 'vue';

export function usePersistedState<T>(
  key: string,
  initialValue: T,
  options: {
    storage?: Storage;
    serializer?: {
      read: (value: string) => T;
      write: (value: T) => string;
    };
  } = {},
) {
  const { storage = localStorage } = options;

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

  const state = ref<T>(initialValue);

  function load() {
    try {
      const value = storage.getItem(key);
      if (value !== null) {
        state.value = serializer.read(value);
      }
    }
    catch (e) {
      console.error('Failed to load persisted state:', e);
    }
  }

  function save(value: T) {
    try {
      storage.setItem(key, serializer.write(value));
    }
    catch (e) {
      console.error('Failed to save persisted state:', e);
    }
  }

  function reset() {
    state.value = initialValue;
    storage.removeItem(key);
  }

  watch(
    state,
    (newValue) => {
      save(newValue);
    },
    { deep: true },
  );

  onMounted(() => {
    load();
  });

  return {
    state,
    load,
    save,
    reset,
  };
}
