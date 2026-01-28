import { describe, it, expect } from 'vitest'
import { useFormValidation } from './useFormValidation'

describe('useFormValidation', () => {
  it('should validate required field', () => {
    const { validate, errors } = useFormValidation()
    validate('email', '', { required: true })

    expect(errors.value.email).toBe('email is required')
  })

  it('should validate min length', () => {
    const { validate, errors } = useFormValidation()
    validate('password', 'ab', { min: 8 })

    expect(errors.value.password).toBe('password must be at least 8 characters')
  })

  it('should validate max length', () => {
    const { validate, errors } = useFormValidation()
    validate('username', 'verylongusername', { max: 10 })

    expect(errors.value.username).toBe('username must not exceed 10 characters')
  })

  it('should validate pattern', () => {
    const { validate, errors } = useFormValidation()
    validate('email', 'invalid', { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })

    expect(errors.value.email).toBe('email format is invalid')
  })

  it('should validate custom rule', () => {
    const { validate, errors } = useFormValidation()
    validate('age', 15, { custom: (v) => v >= 18 || 'Must be 18 or older' })

    expect(errors.value.age).toBe('Must be 18 or older')
  })

  it('should clear errors', () => {
    const { validate, clearErrors, errors } = useFormValidation()
    validate('email', '', { required: true })
    clearErrors()

    expect(Object.keys(errors.value)).toHaveLength(0)
  })

  it('should clear field error', () => {
    const { validate, clearFieldError, errors } = useFormValidation()
    validate('email', '', { required: true })
    clearFieldError('email')

    expect(errors.value.email).toBeUndefined()
  })
})
