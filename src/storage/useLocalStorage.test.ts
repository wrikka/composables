import { describe, it, expect, beforeEach } from 'vitest'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with a default value if localStorage is empty', () => {
    const { value } = useLocalStorage('my-key', 'default')
    expect(value.value).toBe('default')
  })

  it('should initialize with the value from localStorage if it exists', () => {
    localStorage.setItem('my-key', JSON.stringify('stored value'))
    const { value } = useLocalStorage('my-key', 'default')
    expect(value.value).toBe('stored value')
  })

  it('should update localStorage when the ref changes', async () => {
    const { value } = useLocalStorage('my-key', 'initial')
    value.value = 'updated'
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(localStorage.getItem('my-key')).toBe(JSON.stringify('updated'))
  })

  it('should handle object values', async () => {
    const { value } = useLocalStorage('my-key', { a: 1 })
    expect(value.value).toEqual({ a: 1 })

    value.value.a = 2
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(localStorage.getItem('my-key')).toBe(JSON.stringify({ a: 2 }))
  })
})
