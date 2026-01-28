import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWebTransport } from './useWebTransport'

describe('useWebTransport', () => {
  beforeEach(() => {
    vi.stubGlobal('WebTransport', class {
      ready = Promise.resolve()
      close = vi.fn()
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should connect to WebTransport', async () => {
    const { connect, isConnected } = useWebTransport()
    const result = await connect('https://example.com')

    expect(result).toBeDefined()
    expect(isConnected.value).toBe(true)
  })

  it('should disconnect from WebTransport', () => {
    const { disconnect, isConnected } = useWebTransport()
    disconnect()

    expect(isConnected.value).toBe(false)
  })

  it('should handle connection errors', async () => {
    vi.stubGlobal('WebTransport', class {
      ready = Promise.reject(new Error('Connection failed'))
      close = vi.fn()
    })

    const { connect, error } = useWebTransport()
    const result = await connect('https://example.com')

    expect(result).toBeNull()
    expect(error.value).toBeInstanceOf(Error)
  })
})
