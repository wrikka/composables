import { ref, watch } from 'vue';

export function useThrottledState<T>(
  initialValue: T,
  delay: number = 300,
) {
  const state = ref<T>(initialValue);
  const throttledState = ref<T>(initialValue);
  let lastUpdate = 0;
  let pendingUpdate: T | null = null;
  let timeout: any = null;

  watch(
    state,
    (newValue) => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdate;

      if (timeSinceLastUpdate >= delay) {
        throttledState.value = newValue;
        lastUpdate = now;
      }
      else {
        pendingUpdate = newValue;
        if (!timeout) {
          timeout = setTimeout(() => {
            if (pendingUpdate !== null) {
              throttledState.value = pendingUpdate;
              pendingUpdate = null;
            }
            timeout = null;
          }, delay - timeSinceLastUpdate);
        }
      }
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
    if (pendingUpdate !== null) {
      throttledState.value = pendingUpdate;
      pendingUpdate = null;
    }
  }

  function cancel() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    pendingUpdate = null;
  }

  return {
    state,
    throttledState,
    setState,
    flush,
    cancel,
  };
}
