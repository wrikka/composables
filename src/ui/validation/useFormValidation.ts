import { ref, computed, watch, type Ref } from 'vue'
import type { FormValidationRule } from './types'

export interface ValidationState<T> {
  value: T
  error: string | null
  isValid: boolean
  isDirty: boolean
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: Partial<Record<keyof T, FormValidationRule[]>>
): {
  values: Ref<T>
  errors: Ref<Partial<Record<keyof T, string>>>
  isDirty: Ref<Partial<Record<keyof T, boolean>>>
  touched: Ref<Partial<Record<keyof T, boolean>>>
  isValid: Ref<boolean>
  isDirtyAny: Ref<boolean>
  touchedAny: Ref<boolean>
  validate: () => boolean
  validateField: (field: keyof T, value: T[keyof T]) => string | null
  setFieldValue: (field: keyof T, value: T[keyof T]) => void
  setFieldError: (field: keyof T, error: string | null) => void
  reset: () => void
  resetField: (field: keyof T) => void
  getFieldState: (field: keyof T) => ValidationState<T[keyof T]>
} {
  const values = ref<T>({ ...initialValues })
  const errors = ref<Partial<Record<keyof T, string>>>({} as Partial<Record<keyof T, string>>)
  const isDirty = ref<Partial<Record<keyof T, boolean>>>({} as Partial<Record<keyof T, boolean>>)
  const touched = ref<Partial<Record<keyof T, boolean>>>({} as Partial<Record<keyof T, boolean>>)

  const validateField = (field: keyof T, value: T[keyof T]): string | null => {
    const fieldRules = rules[field]
    if (!fieldRules || fieldRules.length === 0) return null

    for (const rule of fieldRules) {
      const result = rule.validate(value)
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message || 'Invalid value'
      }
    }

    return null
  }

  const validate = (): boolean => {
    let isValid = true

    for (const field in rules) {
      const error = validateField(field as keyof T, values.value[field as keyof T])
      if (error) {
        errors.value[field as keyof T] = error
        isValid = false
      } else {
        delete errors.value[field as keyof T]
      }
    }

    return isValid
  }

  const setFieldValue = (field: keyof T, value: T[keyof T]) => {
    values.value[field] = value
    isDirty.value[field] = true
    touched.value[field] = true

    const error = validateField(field, value)
    if (error) {
      errors.value[field] = error
    } else {
      delete errors.value[field]
    }
  }

  const setFieldError = (field: keyof T, error: string | null) => {
    if (error) {
      errors.value[field] = error
    } else {
      delete errors.value[field]
    }
  }

  const reset = () => {
    values.value = { ...initialValues }
    errors.value = {} as Partial<Record<keyof T, string>>
    isDirty.value = {} as Partial<Record<keyof T, boolean>>
    touched.value = {} as Partial<Record<keyof T, boolean>>
  }

  const resetField = (field: keyof T) => {
    values.value[field] = initialValues[field]
    delete errors.value[field]
    delete isDirty.value[field]
    delete touched.value[field]
  }

  const getFieldState = (field: keyof T): ValidationState<T[keyof T]> => ({
    value: values.value[field],
    error: errors.value[field] || null,
    isValid: !errors.value[field],
    isDirty: !!isDirty.value[field]
  })

  const isValid = computed(() => Object.keys(errors.value).length === 0)
  const isDirtyAny = computed(() => Object.values(isDirty.value).some(Boolean))
  const touchedAny = computed(() => Object.values(touched.value).some(Boolean))

  // Watch for value changes and validate
  watch(values, (newValues) => {
    for (const field in newValues) {
      if (isDirty.value[field as keyof T]) {
        const error = validateField(field as keyof T, newValues[field as keyof T])
        if (error) {
          errors.value[field as keyof T] = error
        } else {
          delete errors.value[field as keyof T]
        }
      }
    }
  }, { deep: true })

  return {
    values: ref(values.value) as Ref<T>,
    errors: ref(errors.value) as Ref<Partial<Record<keyof T, string>>>,
    isDirty: ref(isDirty.value) as Ref<Partial<Record<keyof T, boolean>>>,
    touched: ref(touched.value) as Ref<Partial<Record<keyof T, boolean>>>,
    isValid,
    isDirtyAny,
    touchedAny,
    validate,
    validateField,
    setFieldValue,
    setFieldError,
    reset,
    resetField,
    getFieldState
  }
}

