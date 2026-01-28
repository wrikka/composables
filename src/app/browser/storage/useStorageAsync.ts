import { ref } from 'vue';

export interface UseStorageAsyncOptions<T> {
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
}

export function useStorageAsync<T>(
  key: string,
  initialValue: T,
  options: UseStorageAsyncOptions<T> = {},
) {
  const data = ref<T>(initialValue);
  const isLoading = ref(false);
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

  async function read() {
    isLoading.value = true;
    error.value = null;

    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        data.value = serializer.read(value);
      }
    }
    catch (e) {
      error.value = e as Error;
    }
    finally {
      isLoading.value = false;
    }
  }

  async function write(value: T) {
    isLoading.value = true;
    error.value = null;

    try {
      const serialized = serializer.write(value);
      localStorage.setItem(key, serialized);
      data.value = value;
    }
    catch (e) {
      error.value = e as Error;
    }
    finally {
      isLoading.value = false;
    }
  }

  async function remove() {
    isLoading.value = true;
    error.value = null;

    try {
      localStorage.removeItem(key);
      data.value = initialValue;
    }
    catch (e) {
      error.value = e as Error;
    }
    finally {
      isLoading.value = false;
    }
  }

  read();

  return {
    data,
    isLoading,
    error,
    read,
    write,
    remove,
  };
}
