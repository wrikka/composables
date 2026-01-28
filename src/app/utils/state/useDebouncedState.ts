import { ref, watch } from 'vue';

export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300,
) {
  const state = ref<T>(initialValue);
  const debouncedState = ref<T>(initialValue);
  let timeout: any = null;

  watch(
    state,
    (newValue) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        debouncedState.value = newValue;
      }, delay);
    },
    { immediate: true },
  );

  function setState(value: T) {
    state.value = value;
  }

  function flush() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    debouncedState.value = state.value;
  }

  function cancel() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }

  return {
    state,
    debouncedState,
    setState,
    flush,
    cancel,
  };
}
