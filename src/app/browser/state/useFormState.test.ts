import { describe, it, expect } from 'vitest'
import { useFormState } from './useFormState'

describe('useFormState', () => {
  it('should initialize with default values', () => {
    const { data } = useFormState<{ name: string }>({
      initialValues: { name: 'test' },
    })

    expect(data.value.name).toBe('test')
  })

  it('should track dirty state', () => {
    const { data, isDirty, isPristine } = useFormState<{ name: string }>({
      initialValues: { name: 'test' },
    })

    expect(isDirty.value).toBe(false)
    expect(isPristine.value).toBe(true)

    data.value.name = 'changed'

    expect(isDirty.value).toBe(true)
    expect(isPristine.value).toBe(false)
  })

  it('should set field data', () => {
    const { setData, data } = useFormState<{ name: string }>()
    setData('name', 'test')

    expect(data.value.name).toBe('test')
  })

  it('should set all data', () => {
    const { setAllData, data } = useFormState<{ name: string; email: string }>()
    setAllData({ name: 'test', email: 'test@example.com' })

    expect(data.value.name).toBe('test')
    expect(data.value.email).toBe('test@example.com')
  })

  it('should reset to initial values', () => {
    const { reset, data } = useFormState<{ name: string }>({
      initialValues: { name: 'test' },
    })

    data.value.name = 'changed'
    reset()

    expect(data.value.name).toBe('test')
  })

  it('should clear all data', () => {
    const { clear, data } = useFormState<{ name: string }>()
    data.value.name = 'test'
    clear()

    expect(data.value.name).toBeUndefined()
  })
})
