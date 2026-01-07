import { ref, watch, type Ref } from 'vue';

export interface Serializer<T> {
  read(raw: string): T;
  write(value: T): string;
}

export const JSONSerializer: Serializer<any> = {
  read: (v: any) => JSON.parse(v),
  write: (v: any) => JSON.stringify(v),
};

export interface UseStorageOptions<T> {
  serializer?: Serializer<T>;
  writeDefaults?: boolean;
}

export function useStorage<T>(key: string, initialValue: T, storage: Storage | undefined, options: UseStorageOptions<T> = {}) {
  const data = ref(initialValue) as Ref<T>;
  const { serializer = JSONSerializer, writeDefaults = true } = options;

  if (storage) {
    const rawValue = storage.getItem(key);
    if (rawValue) {
      try {
        data.value = serializer.read(rawValue);
      } catch (e) {
        console.error(e);
      }
    } else if (writeDefaults) {
      storage.setItem(key, serializer.write(initialValue));
    }
  }

  watch(data, (newValue) => {
    if (storage) {
      if (newValue === null || newValue === undefined) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, serializer.write(newValue));
      }
    }
  }, { deep: true });

  return data;
}
