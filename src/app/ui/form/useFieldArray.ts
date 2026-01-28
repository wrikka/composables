import { ref, computed } from 'vue';

export interface UseFieldArrayOptions<T> {
  defaultValues?: T[];
  validate?: (values: T[]) => string | null;
  minItems?: number;
  maxItems?: number;
}

export function useFieldArray<T>(name: string, options: UseFieldArrayOptions<T> = {}) {
  const values = ref<T[]>(options.defaultValues || []);
  const error = ref<string | null>(null);
  const touched = ref(false);
  const dirty = ref(false);

  const {
    validate,
    minItems = 0,
    maxItems = Infinity,
  } = options;

  const count = computed(() => values.value.length);
  const isEmpty = computed(() => values.value.length === 0);
  const canAdd = computed(() => values.value.length < maxItems);
  const canRemove = computed(() => values.value.length > minItems);

  const isValid = computed(() => {
    if (minItems > 0 && values.value.length < minItems) {
      return false;
    }
    return error.value === null;
  });

  function add(item: T, index?: number) {
    if (canAdd.value) {
      if (index !== undefined) {
        values.value.splice(index, 0, item as any);
      }
      else {
        values.value.push(item as any);
      }
      dirty.value = true;
      if (touched.value) {
        validateValues();
      }
    }
  }

  function remove(index: number) {
    if (canRemove.value && index >= 0 && index < values.value.length) {
      values.value.splice(index, 1);
      dirty.value = true;
      if (touched.value) {
        validateValues();
      }
    }
  }

  function replace(index: number, item: T) {
    if (index >= 0 && index < values.value.length) {
      values.value[index] = item as any;
      dirty.value = true;
      if (touched.value) {
        validateValues();
      }
    }
  }

  function move(fromIndex: number, toIndex: number) {
    if (fromIndex >= 0 && fromIndex < values.value.length && toIndex >= 0 && toIndex < values.value.length) {
      const [item] = values.value.splice(fromIndex, 1);
      if (item !== undefined) {
        values.value.splice(toIndex, 0, item);
        dirty.value = true;
      }
    }
  }

  function swap(index1: number, index2: number) {
    if (index1 >= 0 && index1 < values.value.length && index2 >= 0 && index2 < values.value.length) {
      const temp = values.value[index1] as any;
      values.value[index1] = values.value[index2] as any;
      values.value[index2] = temp;
      dirty.value = true;
    }
  }

  function clear() {
    values.value = [];
    dirty.value = true;
    if (touched.value) {
      validateValues();
    }
  }

  function reset() {
    values.value = options.defaultValues || [];
    error.value = null;
    touched.value = false;
    dirty.value = false;
  }

  function touch() {
    touched.value = true;
    validateValues();
  }

  function validateValues(): boolean {
    if (minItems > 0 && values.value.length < minItems) {
      error.value = `${name} must have at least ${minItems} item(s)`;
      return false;
    }

    if (maxItems !== Infinity && values.value.length > maxItems) {
      error.value = `${name} cannot have more than ${maxItems} item(s)`;
      return false;
    }

    if (validate) {
      const validationError = validate(values.value as T[]);
      error.value = validationError;
      return validationError === null;
    }

    return true;
  }

  return {
    name,
    values,
    count,
    isEmpty,
    canAdd,
    canRemove,
    error,
    touched,
    dirty,
    isValid,
    add,
    remove,
    replace,
    move,
    swap,
    clear,
    reset,
    touch,
    validateValues,
  };
}
