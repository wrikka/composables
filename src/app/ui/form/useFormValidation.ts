import { ref, computed } from 'vue';

export interface ValidationRule {
  name: string;
  validate: (value: any) => boolean;
  message: string;
}

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: Record<keyof T, ValidationRule[]>,
  options: UseFormValidationOptions = {},
) {
  const values = ref<T>({ ...initialValues });
  const errors = ref<Record<string, string>>({});
  const touched = ref<Set<string>>(new Set());
  const dirty = ref<Set<string>>(new Set());

  const {
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0;
  });

  const isDirty = computed(() => {
    return dirty.value.size > 0;
  });

  function setValue<K extends keyof T>(key: K, value: T[K]) {
    values.value[key] = value;
    dirty.value.add(String(key));

    if (validateOnChange && touched.value.has(String(key))) {
      validateField(key);
    }
  }

  function touchField<K extends keyof T>(key: K) {
    touched.value.add(String(key));

    if (validateOnBlur) {
      validateField(key);
    }
  }

  function validateField<K extends keyof T>(key: K): boolean {
    const fieldRules = rules[key] || [];
    const value = values.value[key];

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        errors.value[key as string] = rule.message;
        return false;
      }
    }

    delete errors.value[key as string];
    return true;
  }

  function validateAll(): boolean {
    let allValid = true;

    Object.keys(rules).forEach((key) => {
      if (!validateField(key as keyof T)) {
        allValid = false;
      }
    });

    return allValid;
  }

  function clearErrors() {
    errors.value = {};
  }

  function reset() {
    values.value = { ...initialValues };
    errors.value = {};
    touched.value.clear();
    dirty.value.clear();
  }

  function getValues(): T {
    return { ...values.value };
  }

  function setValues(newValues: Partial<T>) {
    Object.keys(newValues).forEach((key) => {
      const typedKey = key as keyof T;
      values.value[typedKey] = newValues[typedKey];
      dirty.value.add(key as string);
    });
  }

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isDirty,
    setValue,
    touchField,
    validateField,
    validateAll,
    clearErrors,
    reset,
    getValues,
    setValues,
  };
}
