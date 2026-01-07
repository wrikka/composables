import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useIndexedDB } from './useIndexedDB'

describe('useIndexedDB', () => {
  beforeEach(() => {
    // Mock indexedDB
    const mockDB = {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          get: vi.fn(),
          getAll: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          clear: vi.fn()
        }))
      }))
    }

    const mockRequest = {
      result: mockDB,
      error: null,
      onsuccess: null as any,
      onerror: null as any,
      onupgradeneeded: null as any
    }

    vi.mocked(indexedDB.open).mockReturnValue(mockRequest as any)
  })

  it('should initialize with default values', () => {
    const { db, isReady, error } = useIndexedDB({
      dbName: 'testDB',
      storeName: 'testStore'
    })

    expect(db.value).toBe(null)
    expect(isReady.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('should have correct methods', () => {
    const { initDB, add, get, getAll, update, remove, clear } = useIndexedDB({
      dbName: 'testDB',
      storeName: 'testStore'
    })

    expect(typeof initDB).toBe('function')
    expect(typeof add).toBe('function')
    expect(typeof get).toBe('function')
    expect(typeof getAll).toBe('function')
    expect(typeof update).toBe('function')
    expect(typeof remove).toBe('function')
    expect(typeof clear).toBe('function')
  })
})
