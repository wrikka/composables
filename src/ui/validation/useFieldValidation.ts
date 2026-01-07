import { ref, computed, watch, type Ref } from 'vue'

export interface ValidationRule<T = any> {
  validate: (value: T) => string | true
  message?: string
}

export function useFieldValidation<T>(
  initialValue: T,
  rules: ValidationRule<T>[] = [],
  options: {
    validateOnBlur?: boolean
    validateOnChange?: boolean
  } = {}
): {
  value: Ref<T>
  error: Ref<string | null>
  touched: Ref<boolean>
  isDirty: Ref<boolean>
  isValid: Ref<boolean>
  hasError: Ref<boolean>
  validate: () => boolean
  validateAsync: () => Promise<boolean>
  reset: (newValue?: T) => void
  setValue: (newValue: T) => void
  setTouched: (isTouched?: boolean) => void
  setError: (errorMessage: string | null) => void
} {
  const { validateOnBlur = false, validateOnChange = true } = options

  const value = ref<T>(initialValue)
  const error = ref<string | null>(null)
  const touched = ref(false)
  const isDirty = ref(false)

  const validate = (): boolean => {
    if (!rules.length) {
      error.value = null
      return true
    }

    for (const rule of rules) {
      const result = rule.validate(value.value)
      if (result !== true) {
        error.value = typeof result === 'string' ? result : rule.message || 'Invalid value'
        return false
      }
    }

    error.value = null
    return true
  }

  const validateAsync = async (): Promise<boolean> => {
    return validate()
  }

  const reset = (newValue?: T) => {
    value.value = newValue !== undefined ? newValue : initialValue
    error.value = null
    touched.value = false
    isDirty.value = false
  }

  const setValue = (newValue: T) => {
    isDirty.value = true
    value.value = newValue
    touched.value = true

    if (validateOnChange) {
      validate()
    }
  }

  const setTouched = (isTouched: boolean = true) => {
    touched.value = isTouched
    if (isTouched && validateOnBlur) {
      validate()
    }
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const isValid = computed(() => error.value === null)
  const hasError = computed(() => error.value !== null)

  // Watch for value changes
  watch(value, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      isDirty.value = true
      if (validateOnChange) {
        validate()
      }
    }
  })

  return {
    value: ref(value.value) as Ref<T>,
    error: ref(error.value) as Ref<string | null>,
    touched: ref(touched.value) as Ref<boolean>,
    isDirty: ref(isDirty.value) as Ref<boolean>,
    isValid,
    hasError,
    validate,
    validateAsync,
    reset,
    setValue,
    setTouched,
    setError
  }
}

// Common validation rules
export const createRequiredRule = (message = 'This field is required'): ValidationRule => ({
  validate: (value) => {
    if (Array.isArray(value)) return value.length > 0 || message
    if (typeof value === 'string') return value.trim().length > 0 || message
    return value !== null && value !== undefined && value !== '' || message
  },
  message
})

export const createMinLengthRule = (min: number, message?: string): ValidationRule<string> => ({
  validate: (value) => value.length >= min || (message ?? `Must be at least ${min} characters`),
  ...(message && { message })
})

export const createMaxLengthRule = (max: number, message?: string): ValidationRule<string> => ({
  validate: (value) => value.length <= max || (message ?? `Must be no more than ${max} characters`),
  ...(message && { message })
})

export const createEmailRule = (message = 'Must be a valid email'): ValidationRule<string> => ({
  validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || message,
  message
})

export const createPatternRule = (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
  validate: (value) => regex.test(value) || message,
  message
})

export const createNumberRule = (message = 'Must be a number'): ValidationRule<string | number> => ({
  validate: (value) => !isNaN(Number(value)) || message,
  message
})

export const createMinRule = (min: number, message?: string): ValidationRule<number> => ({
  validate: (value) => value >= min || (message ?? `Must be at least ${min}`),
  ...(message && { message })
})

export const createMaxRule = (max: number, message?: string): ValidationRule<number> => ({
  validate: (value) => value <= max || (message ?? `Must be no more than ${max}`),
  ...(message && { message })
})
