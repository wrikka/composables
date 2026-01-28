import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useContentIndex } from './useContentIndex'

describe('useContentIndex', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      indexedDB: {
        open: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should add content to index', async () => {
    const mockDB = {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          put: vi.fn(),
        })),
      })),
    }

    vi.mocked(navigator.indexedDB.open).mockResolvedValueOnce(mockDB as any)

    const { add, isAdding } = useContentIndex()
    await add('test-id', 'test content')

    expect(isAdding.value).toBe(false)
  })

  it('should delete content from index', async () => {
    const mockDB = {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          delete: vi.fn(),
        })),
      })),
    }

    vi.mocked(navigator.indexedDB.open).mockResolvedValueOnce(mockDB as any)

    const { delete: deleteFn, isDeleting } = useContentIndex()
    await deleteFn('test-id')

    expect(isDeleting.value).toBe(false)
  })

  it('should search content in index', async () => {
    const mockDB = {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          getAll: vi.fn().mockResolvedValue([
            { id: '1', content: 'test content' },
            { id: '2', content: 'another content' },
          ]),
        })),
      })),
    }

    vi.mocked(navigator.indexedDB.open).mockResolvedValueOnce(mockDB as any)

    const { search, isSearching } = useContentIndex()
    const results = await search('test')

    expect(results).toHaveLength(1)
    expect(isSearching.value).toBe(false)
  })
})
