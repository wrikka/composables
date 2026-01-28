import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useBackgroundSync } from './useBackgroundSync'

describe('useBackgroundSync', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      serviceWorker: {
        ready: Promise.resolve({
          sync: {
            register: vi.fn(),
            getTags: vi.fn(),
          },
        }),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should register background sync', async () => {
    const { register, isRegistering } = useBackgroundSync()
    await register('sync-tag')

    expect(isRegistering.value).toBe(false)
  })

  it('should handle registration errors', async () => {
    vi.stubGlobal('navigator', {
      serviceWorker: {
        ready: Promise.reject(new Error('Not supported')),
      },
    })

    const { register, error } = useBackgroundSync()
    await register('sync-tag')

    expect(error.value).toBeInstanceOf(Error)
  })
})
