import { describe, it, expect } from 'vitest'
import { useFormValidation } from './useFormValidation'
import { required, minLength, email } from './useValidationRules'

describe('useFormValidation', () => {
  it('should initialize with form values', () => {
    const { values, errors, isValid, isDirtyAny } = useFormValidation(
      { name: '', email: '' },
      {
        name: [required()],
        email: [required(), email()]
      }
    )

    expect(values.value).toEqual({ name: '', email: '' })
    expect(errors.value).toEqual({})
    expect(isValid.value).toBe(true)
    expect(isDirtyAny.value).toBe(false)
  })

  it('should validate required fields', () => {
    const { setFieldValue, errors } = useFormValidation(
      { name: '', email: '' },
      {
        name: [required()],
        email: [required()]
      }
    )

    setFieldValue('name', '')
    expect(errors.value.name).toBe('This field is required')

    setFieldValue('name', 'John')
    expect(errors.value.name).toBeUndefined()
  })

  it('should validate email format', () => {
    const { setFieldValue, errors } = useFormValidation(
      { email: '' },
      {
        email: [required(), email()]
      }
    )

    setFieldValue('email', 'invalid')
    expect(errors.value.email).toBe('Must be a valid email')

    setFieldValue('email', 'test@example.com')
    expect(errors.value.email).toBeUndefined()
  })

  it('should validate multiple rules', () => {
    const { setFieldValue, errors } = useFormValidation(
      { password: '' },
      {
        password: [required(), minLength(8)]
      }
    )

    setFieldValue('password', '123')
    expect(errors.value.password).toBe('Must be at least 8 characters')

    setFieldValue('password', '12345678')
    expect(errors.value.password).toBeUndefined()
  })

  it('should reset form', () => {
    const { setFieldValue, reset, values, errors, isDirtyAny } = useFormValidation(
      { name: 'John', email: 'john@example.com' },
      {
        name: [required()],
        email: [required(), email()]
      }
    )

    setFieldValue('name', '')
    expect(values.value.name).toBe('')
    expect(isDirtyAny.value).toBe(true)

    reset()
    expect(values.value).toEqual({ name: 'John', email: 'john@example.com' })
    expect(Object.keys(errors.value)).toHaveLength(0)
    expect(isDirtyAny.value).toBe(false)
  })

  it('should get field state', () => {
    const { getFieldState, setFieldValue } = useFormValidation(
      { name: '' },
      {
        name: [required()]
      }
    )

    const state = getFieldState('name')
    expect(state).toEqual({
      value: '',
      error: null,
      isValid: true,
      isDirty: false
    })

    setFieldValue('name', '')
    const updatedState = getFieldState('name')
    expect(updatedState.isDirty).toBe(true)
    expect(updatedState.error).toBe('This field is required')
    expect(updatedState.isValid).toBe(false)
  })

  it('should validate all fields', () => {
    const { validate, setFieldValue, isValid } = useFormValidation(
      { name: '', email: '' },
      {
        name: [required()],
        email: [required(), email()]
      }
    )

    setFieldValue('name', '')
    setFieldValue('email', 'invalid')

    const result = validate()
    expect(result).toBe(false)
    expect(isValid.value).toBe(false)
  })
})
