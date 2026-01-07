import { ref, computed, type Ref, ComputedRef } from 'vue'

export interface FormField {
  value: any
  error?: string
  touched?: boolean
  dirty?: boolean
  validating?: boolean
}

export interface FormOptions<T extends Record<string, any>> {
  initialValues?: Partial<T>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  resetOnSubmit?: boolean
}

export interface FormReturn<T extends Record<string, any>> {
  values: Ref<T>
  errors: Ref<Partial<Record<keyof T, string>>>
  touched: Ref<Partial<Record<keyof T, boolean>>>
  dirty: Ref<Partial<Record<keyof T, boolean>>>
  isValid: ComputedRef<boolean>
  isDirty: ComputedRef<boolean>
  isSubmitting: Ref<boolean>
  setValue: (field: keyof T, value: any) => void
  setError: (field: keyof T, error?: string) => void
  setTouched: (field: keyof T, touched?: boolean) => void
  setDirty: (field: keyof T, dirty?: boolean) => void
  validate: (field?: keyof T) => Promise<boolean>
  validateAll: () => Promise<boolean>
  reset: () => void
  resetField: (field: keyof T) => void
  submit: (handler: (values: T) => Promise<void> | void) => Promise<void>
  getFieldProps: (field: keyof T) => {
    value: any
    error: string | undefined
    touched: boolean | undefined
    dirty: boolean | undefined
    'onUpdate:modelValue': (value: any) => void
    onBlur: () => void
    onChange: () => void
  }
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validator?: (values: T) => Partial<Record<keyof T, string>> | Promise<Partial<Record<keyof T, string>>>,
  options: FormOptions<T> = {}
): FormReturn<T> {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSubmit = false
  } = options

  const values = ref<T>({ ...initialValues }) as Ref<T>
  const errors = ref<Partial<Record<keyof T, string>>>({}) as Ref<Partial<Record<keyof T, string>>>
  const touched = ref<Partial<Record<keyof T, boolean>>>({}) as Ref<Partial<Record<keyof T, boolean>>>
  const dirty = ref<Partial<Record<keyof T, boolean>>>({}) as Ref<Partial<Record<keyof T, boolean>>>
  const isSubmitting = ref(false)

  const isValid = computed(() => Object.keys(errors.value).length === 0)
  const isDirty = computed(() => Object.values(dirty.value).some(Boolean))

  const setValue = (field: keyof T, value: any) => {
    values.value[field] = value
    dirty.value[field] = true
    
    if (validateOnChange && touched.value[field]) {
      validate(field)
    }
  }

  const setError = (field: keyof T, error?: string) => {
    if (error) {
      errors.value[field] = error
    } else {
      delete errors.value[field]
    }
  }

  const setTouched = (field: keyof T, touchedValue = true) => {
    touched.value[field] = touchedValue
    
    if (validateOnBlur && touchedValue) {
      validate(field)
    }
  }

  const setDirty = (field: keyof T, dirtyValue = true) => {
    dirty.value[field] = dirtyValue
  }

  const validate = async (field?: keyof T): Promise<boolean> => {
    if (!validator) return true

    try {
      const validationErrors = await validator(values.value)
      
      if (field) {
        setError(field, validationErrors[field])
        return !validationErrors[field]
      } else {
        errors.value = validationErrors
        return Object.keys(validationErrors).length === 0
      }
    } catch (error) {
      console.error('Validation error:', error)
      return false
    }
  }

  const validateAll = async (): Promise<boolean> => {
    return validate()
  }

  const reset = () => {
    values.value = { ...initialValues }
    errors.value = {}
    touched.value = {}
    dirty.value = {}
    isSubmitting.value = false
  }

  const resetField = (field: keyof T) => {
    values.value[field] = initialValues[field]
    delete errors.value[field]
    delete touched.value[field]
    delete dirty.value[field]
  }

  const submit = async (handler: (values: T) => Promise<void> | void) => {
    isSubmitting.value = true
    
    try {
      const isValid = await validateAll()
      
      if (isValid) {
        await handler(values.value)
        
        if (resetOnSubmit) {
          reset()
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      isSubmitting.value = false
    }
  }

  const getFieldProps = (field: keyof T) => {
    return {
      value: values.value[field],
      error: errors.value[field],
      touched: touched.value[field],
      dirty: dirty.value[field],
      'onUpdate:modelValue': (value: any) => setValue(field, value),
      onBlur: () => setTouched(field, true),
      onChange: () => setDirty(field, true)
    }
  }

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isDirty,
    isSubmitting,
    setValue,
    setError,
    setTouched,
    setDirty,
    validate,
    validateAll,
    reset,
    resetField,
    submit,
    getFieldProps
  }
}
