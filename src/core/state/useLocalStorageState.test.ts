import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLocalStorageState } from './useLocalStorageState'

describe('useLocalStorageState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    }
    vi.stubGlobal('localStorage', localStorageMock)
  })

  it('should initialize with initial value', () => {
    const { state } = useLocalStorageState('test-key', 'initial-value')
    expect(state.value).toBe('initial-value')
  })

  it('should initialize with function initial value', () => {
    const { state } = useLocalStorageState('test-key', () => 'computed-value')
    expect(state.value).toBe('computed-value')
  })

  it('should read from localStorage on mount', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('{"name": "John"}')
    
    useLocalStorageState('test-key', { name: 'Default' })
    
    expect(localStorage.getItem).toHaveBeenCalledWith('test-key')
    // Note: In real scenario, this would be updated after mount
  })

  it('should write to localStorage on state change', () => {
    const { state } = useLocalStorageState('test-key', 'initial')
    
    state.value = 'updated'
    
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', '"updated"')
  })

  it('should handle complex objects', () => {
    const { state } = useLocalStorageState('test-key', { count: 0 })
    
    state.value = { count: 5 }
    
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', '{"count":5}')
  })

  it('should use custom serializer', () => {
    const customSerializer = {
      read: (value: string) => parseInt(value, 10),
      write: (value: number) => value.toString()
    }
    
    const { state } = useLocalStorageState('test-key', 0, {
      serializer: customSerializer
    })
    
    state.value = 42
    
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', '42')
  })

  it('should handle setValue with function', () => {
    const { state, setValue } = useLocalStorageState('test-key', 0)
    
    setValue(prev => prev + 10)
    
    expect(state.value).toBe(10)
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', '10')
  })

  it('should remove value', () => {
    const { state, removeValue } = useLocalStorageState('test-key', 'initial')
    
    removeValue()
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key')
    expect(state.value).toBe('initial')
  })

  it('should handle errors gracefully', () => {
    const onError = vi.fn()
    const originalSetItem = localStorage.setItem
    localStorage.setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded')
    })
    
    const { state } = useLocalStorageState('test-key', 'initial', { onError })
    
    state.value = 'updated'
    
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
    
    // Restore original function
    localStorage.setItem = originalSetItem
  })
})
