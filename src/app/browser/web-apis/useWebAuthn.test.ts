import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWebAuthn } from './useWebAuthn'

describe('useWebAuthn', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      credentials: {
        create: vi.fn(),
        get: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should register credential', async () => {
    vi.mocked(navigator.credentials.create).mockResolvedValueOnce({} as Credential)

    const { register, isRegistering } = useWebAuthn()
    const result = await register('testuser')

    expect(result).toBeDefined()
    expect(isRegistering.value).toBe(false)
  })

  it('should authenticate credential', async () => {
    vi.mocked(navigator.credentials.get).mockResolvedValueOnce({} as Credential)

    const { authenticate, isAuthenticating } = useWebAuthn()
    const result = await authenticate('testuser')

    expect(result).toBeDefined()
    expect(isAuthenticating.value).toBe(false)
  })

  it('should handle registration errors', async () => {
    vi.mocked(navigator.credentials.create).mockRejectedValueOnce(new Error('Not supported'))

    const { register, error } = useWebAuthn()
    const result = await register('testuser')

    expect(result).toBeNull()
    expect(error.value).toBeInstanceOf(Error)
  })
})
