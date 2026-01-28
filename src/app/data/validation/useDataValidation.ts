import { computed, ref } from "vue";

type ValidationRule<T> = (value: T, data?: any) => boolean | string;
type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]> | ValidationRule<T[K]>[];
};

interface ValidationErrors {
  [key: string]: string | null | undefined;
}

interface UseDataValidationOptions<T> {
  schema?: ValidationSchema<T>;
  validateOnChange?: boolean;
}

export function useDataValidation<T extends Record<string, any>>(
  options: UseDataValidationOptions<T> = {},
) {
  const { schema = {}, validateOnChange = true } = options;

  const data = ref<Partial<T>>({});
  const errors = ref<ValidationErrors>({});
  const isValid = computed(() => Object.keys(errors.value).length === 0);
  const isDirty = ref(false);

  const validateField = (key: keyof T, value: any): string | null => {
    const rules = schema[key];
    if (!rules) return null;

    const ruleArray = Array.isArray(rules) ? rules : [rules];

    for (const rule of ruleArray) {
      const result = rule(value, data.value);
      if (result === false) {
        return "Invalid value";
      }
      if (typeof result === "string") {
        return result;
      }
    }

    return null;
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    let hasErrors = false;

    for (const key in schema) {
      const error = validateField(key, data.value[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    }

    errors.value = newErrors;
    return !hasErrors;
  };

  const setData = (key: keyof T, value: T[keyof T]) => {
    data.value[key] = value;
    isDirty.value = true;

    if (validateOnChange) {
      const error = validateField(key, value);
      if (error) {
        errors.value[key] = error;
      } else {
        delete errors.value[key];
      }
    }
  };

  const setAllData = (newData: Partial<T>) => {
    data.value = { ...newData };
    isDirty.value = true;

    if (validateOnChange) {
      validate();
    }
  };

  const clearErrors = () => {
    errors.value = {};
  };

  const clearFieldError = (key: keyof T) => {
    delete errors.value[key];
  };

  const reset = () => {
    data.value = {};
    errors.value = {};
    isDirty.value = false;
  };

  const getErrors = computed(() => errors.value);
  const getFieldError = (key: keyof T) => errors.value[key];

  return {
    data,
    errors: getErrors,
    isValid,
    isDirty,
    setData,
    setAllData,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    reset,
    getFieldError,
  };
}
