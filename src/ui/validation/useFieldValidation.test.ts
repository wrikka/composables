import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFieldValidation, createRequiredRule, createEmailRule, createMinLengthRule } from './useFieldValidation'

describe('useFieldValidation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should initialize with initial value', () => {
    const { value, error, isValid, touched, isDirty } = useFieldValidation<string>('initial')

    expect(value.value).toBe('initial')
    expect(error.value).toBe(null)
    expect(isValid.value).toBe(true)
    expect(touched.value).toBe(false)
    expect(isDirty.value).toBe(false)
  })

  it('should validate required field', () => {
    const { validate, error, isValid } = useFieldValidation<string>('', [
      createRequiredRule()
    ])

    const result = validate()
    expect(result).toBe(false)
    expect(error.value).toBe('This field is required')
    expect(isValid.value).toBe(false)
  })

  it('should validate email format', () => {
    const { value, validate, error, isValid } = useFieldValidation<string>('', [
      createEmailRule()
    ])

    value.value = 'invalid-email'
    validate()
    expect(error.value).toBe('Must be a valid email')
    expect(isValid.value).toBe(false)

    value.value = 'test@example.com'
    validate()
    expect(error.value).toBe(null)
    expect(isValid.value).toBe(true)
  })

  it('should validate multiple rules', () => {
    const { value, validate, error, isValid } = useFieldValidation<string>('', [
      createRequiredRule(),
      createMinLengthRule(5)
    ])

    value.value = 'abc'
    validate()
    expect(error.value).toBe('Must be at least 5 characters')
    expect(isValid.value).toBe(false)

    value.value = 'abcdefgh'
    validate()
    expect(error.value).toBe(null)
    expect(isValid.value).toBe(true)
  })

  it('should handle setValue with validation', () => {
    const { value, setValue, error, touched, isDirty } = useFieldValidation<string>('', [
      createRequiredRule()
    ])

    setValue('new value')
    expect(value.value).toBe('new value')
    expect(touched.value).toBe(true)
    expect(isDirty.value).toBe(true)
    expect(error.value).toBe(null)
  })

  it('should handle setTouched', () => {
    const { setTouched, touched } = useFieldValidation<string>('value', [], {
      validateOnBlur: true
    })

    setTouched()
    expect(touched.value).toBe(true)
  })

  it('should handle reset', () => {
    const { value, reset, error, touched, isDirty } = useFieldValidation<string>('initial', [
      createRequiredRule()
    ])

    value.value = 'changed'
    reset()
    expect(value.value).toBe('initial')
    expect(error.value).toBe(null)
    expect(touched.value).toBe(false)
    expect(isDirty.value).toBe(false)
  })

  it('should reset with new value', () => {
    const { value, reset } = useFieldValidation<string>('initial')

    reset('new initial')
    expect(value.value).toBe('new initial')
  })

  it('should set custom error', () => {
    const { setError, error, isValid } = useFieldValidation<string>('value')

    setError('Custom error message')
    expect(error.value).toBe('Custom error message')
    expect(isValid.value).toBe(false)
  })

  it('should compute hasError correctly', () => {
    const { error, hasError } = useFieldValidation<string>('value')

    expect(hasError.value).toBe(false)

    error.value = 'Some error'
    expect(hasError.value).toBe(true)
  })

  it('should handle async validation', async () => {
    const { validateAsync, isValid } = useFieldValidation<string>('value', [
      createRequiredRule()
    ])

    const result = await validateAsync()
    expect(result).toBe(true)
    expect(isValid.value).toBe(true)
  })
})
