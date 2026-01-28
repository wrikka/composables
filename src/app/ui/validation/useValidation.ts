import { ref, computed } from 'vue';

export interface ValidationRule {
  name: string;
  validate: (value: any) => boolean;
  message: string;
}

export interface UseValidationOptions {
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export function useValidation<T>(initialValue: T, rules: Record<string, ValidationRule[]>, options: UseValidationOptions = {}) {
  const value = ref<T>(initialValue);
  const errors = ref<Record<string, string>>({});
  const touched = ref<Set<string>>(new Set());
  const dirty = ref<Set<string>>(new Set());

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

  function setValue(newValue: T) {
    value.value = newValue;
    dirty.value.add('all');

    if (validateOnChange && touched.value.has('all')) {
      validateAll();
    }
  }

  function touchField(fieldName: string) {
    touched.value.add(fieldName);

    if (validateOnBlur) {
      validateField(fieldName);
    }
  }

  function validateField(fieldName: string): boolean {
    const fieldRules = rules[fieldName] || [];
    const fieldValue = value.value as any;

    for (const rule of fieldRules) {
      if (!rule.validate(fieldValue)) {
        errors.value[fieldName] = rule.message;
        return false;
      }
    }

    delete errors.value[fieldName];
    return true;
  }

  function validateAll(): boolean {
    let allValid = true;

    Object.keys(rules).forEach((fieldName) => {
      if (!validateField(fieldName)) {
        allValid = false;
      }
    });

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
