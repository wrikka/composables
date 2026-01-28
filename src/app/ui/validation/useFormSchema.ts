import { ref, computed } from 'vue';

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  default?: any;
  validate?: (value: any) => boolean | string;
  schema?: SchemaField | SchemaField[];
  properties?: Record<string, SchemaField>;
  items?: SchemaField;
}

export interface UseFormSchemaOptions {
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export function useFormSchema<T extends Record<string, any>>(
  schema: Record<string, SchemaField>,
  options: UseFormSchemaOptions = {},
) {
  const values = ref<T>({} as T);
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

  function setValue<K extends keyof T>(key: K, value: T[K]) {
    values.value[key] = value;
    dirty.value.add(key as string);

    if (validateOnChange && touched.value.has(key as string)) {
      validateField(key as string);
    }
  }

  function setValues(newValues: Partial<T>) {
    Object.keys(newValues).forEach((key) => {
      const typedKey = key as keyof T;
      values.value[typedKey] = newValues[typedKey];
      dirty.value.add(key as string);
    });
  }

  function touchField<K extends keyof T>(key: K) {
    touched.value.add(key as string);

    if (validateOnBlur) {
      validateField(key as string);
    }
  }

  function validateField(fieldName: string): boolean {
    const field = schema[fieldName];
    const value = values.value[fieldName as keyof T];

    if (!field) {
      return true;
    }

    if (field.required && (value === null || value === undefined || value === '')) {
      errors.value[fieldName] = `${fieldName} is required`;
      return false;
    }

    if (field.type === 'string' && typeof value !== 'string') {
      errors.value[fieldName] = `${fieldName} must be a string`;
      return false;
    }

    if (field.type === 'number' && typeof value !== 'number') {
      errors.value[fieldName] = `${fieldName} must be a number`;
      return false;
    }

    if (field.type === 'boolean' && typeof value !== 'boolean') {
      errors.value[fieldName] = `${fieldName} must be a boolean`;
      return false;
    }

    if (field.type === 'array' && !Array.isArray(value)) {
      errors.value[fieldName] = `${fieldName} must be an array`;
      return false;
    }

    if (field.type === 'object' && (typeof value !== 'object' || value === null)) {
      errors.value[fieldName] = `${fieldName} must be an object`;
      return false;
    }

    if (field.validate) {
      const result = field.validate(value);
      if (typeof result === 'string') {
        errors.value[fieldName] = result;
        return false;
      }
      if (!result) {
        errors.value[fieldName] = `${fieldName} is invalid`;
        return false;
      }
    }

    if (field.properties && typeof value === 'object') {
      for (const propName in field.properties) {
        const propField = field.properties[propName];
        const propValue = (value as any)[propName];

        if (!propField) continue;

        if (propField.required && (propValue === null || propValue === undefined || propValue === '')) {
          errors.value[`${fieldName}.${propName}`] = `${propName} is required`;
          return false;
        }

        if (propField.type === 'string' && typeof propValue !== 'string') {
          errors.value[`${fieldName}.${propName}`] = `${propName} must be a string`;
          return false;
        }

        if (propField.type === 'number' && typeof propValue !== 'number') {
          errors.value[`${fieldName}.${propName}`] = `${propName} must be a number`;
          return false;
        }

        if (propField.type === 'boolean' && typeof propValue !== 'boolean') {
          errors.value[`${fieldName}.${propName}`] = `${propName} must be a boolean`;
          return false;
        }
      }
    }

    delete errors.value[fieldName];
    return true;
  }

  function validateAll(): boolean {
    let allValid = true;

    Object.keys(schema).forEach((fieldName) => {
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
    values.value = {} as T;
    errors.value = {};
    touched.value.clear();
    dirty.value.clear();
  }

  function markAsDirty() {
    Object.keys(schema).forEach(fieldName => {
      dirty.value.add(fieldName);
    });
  }

  function markAsTouched() {
    Object.keys(schema).forEach(fieldName => {
      touched.value.add(fieldName);
    });
  }

  function getValues(): T {
    return { ...values.value };
  }

  function getErrors(): Record<string, string> {
    return { ...errors.value };
  }

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isDirty,
    setValue,
    setValues,
    touchField,
    validateField,
    validateAll,
    clearErrors,
    reset,
    markAsDirty,
    markAsTouched,
    getValues,
    getErrors,
  };
}
