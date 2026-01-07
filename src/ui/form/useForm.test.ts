import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { useForm } from './useForm'

describe('useForm', () => {
  it('should initialize with values', () => {
    const { values } = useForm({ name: 'John', email: 'john@example.com' })
    expect(values.value).toEqual({ name: 'John', email: 'john@example.com' })
  })

  it('should update a field value with setValue', async () => {
    const { values, setValue } = useForm({ name: 'John' })
    setValue('name', 'Jane')
    await nextTick()
    expect(values.value.name).toBe('Jane')
  })

  it('should reset the form to initial values', async () => {
    const { values, setValue, reset } = useForm({ name: 'John' })
    setValue('name', 'Jane')
    reset()
    await nextTick()
    expect(values.value.name).toBe('John')
  })

  it('should validate using the validator function', async () => {
    const validator = (values: { email: string }) => {
      const errors: { email?: string } = {}
      if (!values.email) {
        errors.email = 'Email is required'
      } else if (!/.+@.+\..+/.test(values.email)) {
        errors.email = 'Invalid email format'
      }
      return errors
    }

    const { errors, values, validate } = useForm({ email: 'invalid' }, validator)

    await validate()
    expect(errors.value.email).toBe('Invalid email format')

    values.value.email = 'valid@email.com'
    await validate()
    expect(errors.value.email).toBeUndefined()
  })

  it('should handle submission', async () => {
    const submitHandler: (values: { name: string }) => void = vi.fn()
    const validator: (values: { name: string }) => { name?: string } = (values) => {
      const errors: { name?: string } = {}
      if (!values.name) errors.name = 'Required'
      return errors
    }

    const { submit, setValue } = useForm({ name: '' }, validator)

    // Try submitting with invalid form
    await submit(submitHandler)
    expect(submitHandler).not.toHaveBeenCalled()

    // Try submitting with valid form
    setValue('name', 'John')
    await submit(submitHandler)
    expect(submitHandler).toHaveBeenCalledWith({ name: 'John' })
  })
})
