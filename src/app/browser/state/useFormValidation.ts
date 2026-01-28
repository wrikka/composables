import { ref, computed } from 'vue'

export interface FormValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface FormValidationState {
  errors: Record<string, string>
  isValid: boolean
  validate: (field: string, value: any, rules: FormValidationRule) => void
  validateAll: (data: Record<string, any>, rules: Record<string, FormValidationRule>) => boolean
  clearErrors: () => void
  clearFieldError: (field: string) => void
}

export function useFormValidation() {
  const errors = ref<Record<string, string>>({})

  const isValid = computed(() => Object.keys(errors.value).length === 0)

  const validate = (field: string, value: any, rules: FormValidationRule) => {
    if (rules.required && !value) {
      errors.value[field] = `${field} is required`
      return
    }

    if (rules.min !== undefined && value && value.length < rules.min) {
      errors.value[field] = `${field} must be at least ${rules.min} characters`
      return
    }

    if (rules.max !== undefined && value && value.length > rules.max) {
      errors.value[field] = `${field} must not exceed ${rules.max} characters`
      return
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.value[field] = `${field} format is invalid`
      return
    }

    if (rules.custom) {
      const result = rules.custom(value)
      if (result === false) {
        errors.value[field] = `${field} is invalid`
        return
      }
      if (typeof result === 'string') {
        errors.value[field] = result
        return
      }
    }

    delete errors.value[field]
  }

  const validateAll = (data: Record<string, any>, rules: Record<string, FormValidationRule>): boolean => {
    errors.value = {}
    let hasErrors = false

    for (const field in rules) {
      validate(field, data[field], rules[field])
      if (errors.value[field]) {
        hasErrors = true
      }
    }

    return !hasErrors
  }

  const clearErrors = () => {
    errors.value = {}
  }

  const clearFieldError = (field: string) => {
    delete errors.value[field]
  }

  return {
    errors,
    isValid,
    validate,
    validateAll,
    clearErrors,
    clearFieldError,
  }
}
