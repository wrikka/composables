import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useStorageCompression } from './useStorageCompression'

describe('useStorageCompression', () => {
  beforeEach(() => {
    if (!('CompressionStream' in window)) {
      vi.stubGlobal('CompressionStream', class {})
    }
    if (!('DecompressionStream' in window)) {
      vi.stubGlobal('DecompressionStream', class {})
    }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should compress data', async () => {
    const { compress, isCompressing } = useStorageCompression()

    const result = await compress('test data')

    expect(result).toBeDefined()
    expect(isCompressing.value).toBe(false)
  })

  it('should decompress data', async () => {
    const { decompress, isDecompressing } = useStorageCompression()

    const result = await decompress('compressed data')

    expect(result).toBeDefined()
    expect(isDecompressing.value).toBe(false)
  })

  it('should handle compression errors', async () => {
    const { compress, error } = useStorageCompression()

    try {
      await compress(null as any)
    } catch (err) {
      expect(error.value).toBeInstanceOf(Error)
    }
  })
})
