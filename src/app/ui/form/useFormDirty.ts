import { ref, computed } from 'vue';

export function useFormDirty<T extends Record<string, any>>(initialValues: T) {
  const values = ref<T>({ ...initialValues });
  const initialValuesRef = ref<T>({ ...initialValues });

  const isDirty = computed(() => {
    return Object.keys(values.value).some(key => {
      return values.value[key as keyof T] !== initialValuesRef.value[key as keyof T];
    });
  });

  const dirtyFields = computed(() => {
    const dirty: string[] = [];
    Object.keys(values.value).forEach(key => {
      if (values.value[key as keyof T] !== initialValuesRef.value[key as keyof T]) {
        dirty.push(key);
      }
    });
    return dirty;
  });

  function setValue<K extends keyof T>(key: K, value: T[K]) {
    values.value[key] = value;
  }

  function setValues(newValues: Partial<T>) {
    Object.keys(newValues).forEach((key) => {
      const typedKey = key as keyof T;
      values.value[typedKey] = newValues[typedKey];
    });
  }

  function reset() {
    values.value = { ...initialValuesRef.value };
  }

  function resetField<K extends keyof T>(key: K) {
    values.value[key] = initialValuesRef.value[key];
  }

  function markAsClean() {
    initialValuesRef.value = { ...values.value };
  }

  function markAsDirty() {
    initialValuesRef.value = { ...initialValues };
  }

  function getDirtyValues(): Partial<T> {
    const dirty: Partial<T> = {};
    Object.keys(values.value).forEach(key => {
      const typedKey = key as keyof T;
      if (values.value[typedKey] !== initialValuesRef.value[typedKey]) {
        dirty[typedKey] = values.value[typedKey];
      }
    });
    return dirty;
  }

  return {
    values,
    isDirty,
    dirtyFields,
    setValue,
    setValues,
    reset,
    resetField,
    markAsClean,
    markAsDirty,
    getDirtyValues,
  };
}
