import { ref, computed } from 'vue'

export interface FormStateOptions<T> {
  initialValues?: Partial<T>
  validateOnChange?: boolean
}

export function useFormState<T extends Record<string, any>>(
  options: FormStateOptions<T> = {}
) {
  const { initialValues = {}, validateOnChange = true } = options

  const data = ref<Partial<T>>({ ...initialValues })
  const isDirty = computed(() => {
    return Object.keys(data.value).some(key => 
      data.value[key] !== initialValues[key]
    )
  })
  const isPristine = computed(() => !isDirty.value)

  const setData = (key: keyof T, value: T[keyof T]) => {
    data.value[key] = value
  }

  const setAllData = (newData: Partial<T>) => {
    data.value = { ...data.value, ...newData }
  }

  const reset = () => {
    data.value = { ...initialValues }
  }

  const clear = () => {
    data.value = {}
  }

  const getField = (key: keyof T) => data.value[key]
  const setField = (key: keyof T, value: T[keyof T]) => {
    data.value[key] = value
  }

  return {
    data,
    isDirty,
    isPristine,
    setData,
    setAllData,
    reset,
    clear,
    getField,
    setField,
  }
}
