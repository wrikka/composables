import { describe, it, expect } from 'vitest'
import { useToggle } from './useToggle'

describe('useToggle', () => {
  it('should initialize with false by default', () => {
    const { value } = useToggle()
    expect(value.value).toBe(false)
  })

  it('should initialize with a given value', () => {
    const { value: v1 } = useToggle(true)
    expect(v1.value).toBe(true)

    const { value: v2 } = useToggle(false)
    expect(v2.value).toBe(false)
  })

  it('should toggle the value', () => {
    const { value, toggle } = useToggle(false)
    toggle()
    expect(value.value).toBe(true)
    toggle()
    expect(value.value).toBe(false)
  })

  it('should set the value with set()', () => {
    const { value, set } = useToggle(false)
    set(true)
    expect(value.value).toBe(true)
    set(false)
    expect(value.value).toBe(false)
  })
})
