import { computed, Ref } from 'vue';

export function useDerivedState<T, R>(
  source: Ref<T> | (() => T),
  derive: (value: T) => R,
) {
  const derived = computed(() => {
    const value = typeof source === 'function' ? source() : source.value;
    return derive(value);
  });

  return {
    derived,
  };
}
