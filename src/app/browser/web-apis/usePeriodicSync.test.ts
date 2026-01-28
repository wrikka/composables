import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePeriodicSync } from './usePeriodicSync'

describe('usePeriodicSync', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      serviceWorker: {
        ready: Promise.resolve({
          periodicSync: {
            register: vi.fn(),
            unregister: vi.fn(),
          },
        }),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should register periodic sync', async () => {
    const { register, isRegistering } = usePeriodicSync()
    await register('sync-tag')

    expect(isRegistering.value).toBe(false)
  })

  it('should unregister periodic sync', async () => {
    const { unregister, isUnregistering } = usePeriodicSync()
    await unregister('sync-tag')

    expect(isUnregistering.value).toBe(false)
  })

  it('should handle registration errors', async () => {
    vi.stubGlobal('navigator', {
      serviceWorker: {
        ready: Promise.reject(new Error('Not supported')),
      },
    })

    const { register, error } = usePeriodicSync()
    await register('sync-tag')

    expect(error.value).toBeInstanceOf(Error)
  })
})
