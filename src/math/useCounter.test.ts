import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('should initialize with 0 by default', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })

  it('should initialize with a given value', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })

  it('should increment the count', () => {
    const { count, inc } = useCounter(5)
    inc()
    expect(count.value).toBe(6)
    inc(5)
    expect(count.value).toBe(11)
  })

  it('should decrement the count', () => {
    const { count, dec } = useCounter(5)
    dec()
    expect(count.value).toBe(4)
    dec(5)
    expect(count.value).toBe(-1)
  })

  it('should get the current count', () => {
    const { count, get } = useCounter(42)
    expect(get()).toBe(42)
    count.value = 99
    expect(get()).toBe(99)
  })

  it('should set the count to a specific value', () => {
    const { count, set } = useCounter(0)
    set(100)
    expect(count.value).toBe(100)
  })

  it('should reset the count to the initial value', () => {
    const { count, inc, reset } = useCounter(10)
    inc(5)
    expect(count.value).toBe(15)
    reset()
    expect(count.value).toBe(10)
  })
})
