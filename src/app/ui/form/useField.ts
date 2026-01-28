import { ref, computed, watch } from 'vue';

export interface UseFieldOptions<T> {
  defaultValue?: T;
  validate?: (value: T) => string | null;
  required?: boolean;
}

export function useField<T>(name: string, options: UseFieldOptions<T> = {}) {
  const value = ref<T>(options.defaultValue as T);
  const error = ref<string | null>(null);
  const touched = ref(false);
  const dirty = ref(false);

  const {
    validate,
    required = false,
  } = options;

  const isValid = computed(() => {
    if (required && (value.value === null || value.value === undefined || value.value === '')) {
      return false;
    }
    return error.value === null;
  });

  function setValue(newValue: T) {
    value.value = newValue;
    dirty.value = true;
    if (touched.value) {
      validateValue();
    }
  }

  function clearError() {
    error.value = null;
  }

  function reset() {
    value.value = options.defaultValue as T;
    error.value = null;
    touched.value = false;
    dirty.value = false;
  }

  function touch() {
    touched.value = true;
    validateValue();
  }

  function validateValue(): boolean {
    if (required && (value.value === null || value.value === undefined || value.value === '')) {
      error.value = `${name} is required`;
      return false;
    }

    if (validate) {
      const validationError = validate(value.value);
      error.value = validationError;
      return validationError === null;
    }

    return true;
  }

  watch(value, () => {
    if (touched.value) {
      validateValue();
    }
  });

  return {
    name,
    value,
    error,
    touched,
    dirty,
    isValid,
    setValue,
    clearError,
    reset,
    touch,
    validateValue,
  };
}
