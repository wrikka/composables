import { useStorage, type UseStorageOptions } from './useStorage';

export function useLocalStorage<T>(key: string, initialValue: T, options: UseStorageOptions<T> = {}) {
  return useStorage(key, initialValue, window.localStorage, options);
}