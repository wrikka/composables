import { ref, computed } from 'vue';

const globalState = new Map<string, any>();

export function useGlobalState<T>(key: string, initialValue: T) {
  if (!globalState.has(key)) {
    globalState.set(key, ref(initialValue));
  }

  const state = globalState.get(key) as any;

  function setState(value: T) {
    state.value = value;
  }

  function resetState() {
    state.value = initialValue;
  }

  return {
    state: computed(() => state.value),
    setState,
    resetState,
  };
}
