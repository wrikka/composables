import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useStorageEncryption } from './useStorageEncryption'

describe('useStorageEncryption', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      subtle: {
        importKey: vi.fn(),
        encrypt: vi.fn(),
        decrypt: vi.fn(),
      },
      getRandomValues: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should encrypt data', async () => {
    const { encrypt, isEncrypting } = useStorageEncryption()

    vi.mocked(crypto.subtle.importKey).mockResolvedValueOnce({} as CryptoKey)
    vi.mocked(crypto.subtle.encrypt).mockResolvedValueOnce(new ArrayBuffer(16))

    const result = await encrypt('test data', 'secret-key')

    expect(result).toBeDefined()
    expect(isEncrypting.value).toBe(false)
  })

  it('should decrypt data', async () => {
    const { decrypt, isDecrypting } = useStorageEncryption()

    vi.mocked(crypto.subtle.importKey).mockResolvedValueOnce({} as CryptoKey)
    vi.mocked(crypto.subtle.decrypt).mockResolvedValueOnce(new ArrayBuffer(16))

    const result = await decrypt('encrypted-data', 'secret-key')

    expect(result).toBeDefined()
    expect(isDecrypting.value).toBe(false)
  })

  it('should handle encryption errors', async () => {
    const { encrypt, error } = useStorageEncryption()

    vi.mocked(crypto.subtle.importKey).mockRejectedValueOnce(new Error('Invalid key'))

    try {
      await encrypt('test data', 'secret-key')
    } catch (err) {
      expect(error.value).toBeInstanceOf(Error)
    }
  })
})
