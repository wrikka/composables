import { describe, it, expect } from 'vitest'
import { useBoolean } from './useBoolean'

describe('useBoolean', () => {
  it('should initialize with false by default', () => {
    const { value } = useBoolean()
    expect(value.value).toBe(false)
  })

  it('should initialize with a given value', () => {
    const { value: v1 } = useBoolean(true)
    expect(v1.value).toBe(true)

    const { value: v2 } = useBoolean(false)
    expect(v2.value).toBe(false)
  })

  it('should set the value to true', () => {
    const { value, setTrue } = useBoolean(false)
    setTrue()
    expect(value.value).toBe(true)
  })

  it('should set the value to false', () => {
    const { value, setFalse } = useBoolean(true)
    setFalse()
    expect(value.value).toBe(false)
  })

  it('should toggle the value', () => {
    const { value, toggle } = useBoolean(false)
    toggle()
    expect(value.value).toBe(true)
    toggle()
    expect(value.value).toBe(false)
  })

  it('should set the value to a specific boolean', () => {
    const { value, set } = useBoolean(false)
    set(true)
    expect(value.value).toBe(true)
    set(false)
    expect(value.value).toBe(false)
  })
})
