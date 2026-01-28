import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useServiceWorker } from './useServiceWorker'

describe('useServiceWorker', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      serviceWorker: {
        register: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should register service worker', async () => {
    vi.mocked(navigator.serviceWorker.register).mockResolvedValueOnce({
      unregister: vi.fn(),
      update: vi.fn(),
    } as ServiceWorkerRegistration)

    const { register, registration } = useServiceWorker()
    const result = await register('/sw.js')

    expect(result).toBeDefined()
    expect(registration.value).toBeDefined()
  })

  it('should handle registration errors', async () => {
    vi.mocked(navigator.serviceWorker.register).mockRejectedValueOnce(new Error('Not supported'))

    const { register, error } = useServiceWorker()
    const result = await register('/sw.js')

    expect(result).toBeNull()
    expect(error.value).toBeInstanceOf(Error)
  })
})
