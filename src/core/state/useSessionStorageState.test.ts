import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSessionStorageState } from './useSessionStorageState'

describe('useSessionStorageState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    }
    vi.stubGlobal('sessionStorage', sessionStorageMock)
  })

  it('should initialize with initial value', () => {
    const { state } = useSessionStorageState('test-key', 'initial-value')
    expect(state.value).toBe('initial-value')
  })

  it('should initialize with function initial value', () => {
    const { state } = useSessionStorageState('test-key', () => 'computed-value')
    expect(state.value).toBe('computed-value')
  })

  it('should read from sessionStorage on mount', () => {
    vi.mocked(sessionStorage.getItem).mockReturnValue('{"name": "John"}')
    
    useSessionStorageState('test-key', { name: 'Default' })
    
    expect(sessionStorage.getItem).toHaveBeenCalledWith('test-key')
  })

  it('should write to sessionStorage on state change', () => {
    const { state } = useSessionStorageState('test-key', 'initial')
    
    state.value = 'updated'
    
    expect(sessionStorage.setItem).toHaveBeenCalledWith('test-key', '"updated"')
  })

  it('should handle complex objects', () => {
    const { state } = useSessionStorageState('test-key', { count: 0 })
    
    state.value = { count: 5 }
    
    expect(sessionStorage.setItem).toHaveBeenCalledWith('test-key', '{"count":5}')
  })

  it('should use custom serializer', () => {
    const customSerializer = {
      read: (value: string) => parseInt(value, 10),
      write: (value: number) => value.toString()
    }
    
    const { state } = useSessionStorageState('test-key', 0, {
      serializer: customSerializer
    })
    
    state.value = 42
    
    expect(sessionStorage.setItem).toHaveBeenCalledWith('test-key', '42')
  })

  it('should handle setValue with function', () => {
    const { state, setValue } = useSessionStorageState('test-key', 0)
    
    setValue(prev => prev + 10)
    
    expect(state.value).toBe(10)
    expect(sessionStorage.setItem).toHaveBeenCalledWith('test-key', '10')
  })

  it('should remove value', () => {
    const { state, removeValue } = useSessionStorageState('test-key', 'initial')
    
    removeValue()
    
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('test-key')
    expect(state.value).toBe('initial')
  })

  it('should handle errors gracefully', () => {
    const onError = vi.fn()
    const originalSetItem = sessionStorage.setItem
    sessionStorage.setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded')
    })
    
    const { state } = useSessionStorageState('test-key', 'initial', { onError })
    
    state.value = 'updated'
    
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
    
    // Restore original function
    sessionStorage.setItem = originalSetItem
  })

  it('should check sessionStorage availability', () => {
    vi.stubGlobal('sessionStorage', undefined)
    
    const { state, setValue } = useSessionStorageState('test-key', 'initial')
    
    setValue('updated')
    
    // Should not throw error when sessionStorage is not available
    expect(state.value).toBe('updated')
  })
})
