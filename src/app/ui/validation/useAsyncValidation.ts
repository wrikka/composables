import { ref, computed } from 'vue';

export interface AsyncValidationRule {
  name: string;
  validate: (value: any) => Promise<boolean | string>;
  message?: string;
}

export interface UseAsyncValidationOptions {
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export function useAsyncValidation<T>(initialValue: T, rules: Record<string, AsyncValidationRule[]>, options: UseAsyncValidationOptions = {}) {
  const value = ref<T>(initialValue);
  const errors = ref<Record<string, string>>({});
  const touched = ref<Set<string>>(new Set());
  const dirty = ref<Set<string>>(new Set());
  const isValidating = ref(false);

  const {
    validateOnBlur = true,
    validateOnChange = false,
  } = options;

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0;
  });

  const isDirty = computed(() => {
    return dirty.value.size > 0;
  });

  async function setValue(newValue: T) {
    value.value = newValue;
    dirty.value.add('all');

    if (validateOnChange && touched.value.has('all')) {
      await validateAll();
    }
  }

  async function touchField(fieldName: string) {
    touched.value.add(fieldName);

    if (validateOnBlur) {
      await validateField(fieldName);
    }
  }

  async function validateField(fieldName: string): Promise<boolean> {
    const fieldRules = rules[fieldName] || [];
    const fieldValue = value.value as any;

    for (const rule of fieldRules) {
      try {
        const result = await rule.validate(fieldValue);
        if (typeof result === 'string') {
          errors.value[fieldName] = result;
          return false;
        }
        if (!result) {
          errors.value[fieldName] = rule.message || 'Validation failed';
          return false;
        }
      }
      catch {
        errors.value[fieldName] = rule.message || 'Validation error';
        return false;
      }
    }

    delete errors.value[fieldName];
    return true;
  }

  async function validateAll(): Promise<boolean> {
    isValidating.value = true;
    let allValid = true;

    for (const fieldName of Object.keys(rules)) {
      const fieldValid = await validateField(fieldName);
      if (!fieldValid) {
        allValid = false;
      }
    }

    isValidating.value = false;
    return allValid;
  }

  function clearErrors() {
    errors.value = {};
  }

  function reset() {
    value.value = initialValue;
    errors.value = {};
    touched.value.clear();
    dirty.value.clear();
    isValidating.value = false;
  }

  function markAsDirty() {
    Object.keys(rules).forEach(fieldName => {
      dirty.value.add(fieldName);
    });
  }

  function markAsTouched() {
    Object.keys(rules).forEach(fieldName => {
      touched.value.add(fieldName);
    });
  }

  return {
    value,
    errors,
    touched,
    dirty,
    isValidating,
    isValid,
    isDirty,
    setValue,
    touchField,
    validateField,
    validateAll,
    clearErrors,
    reset,
    markAsDirty,
    markAsTouched,
  };
}
