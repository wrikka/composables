import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWebAssembly } from './useWebAssembly'

describe('useWebAssembly', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('WebAssembly', {
      compile: vi.fn(),
      instantiate: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should load WebAssembly module', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
    } as Response)

    vi.mocked(WebAssembly.compile).mockResolvedValueOnce({} as WebAssembly.Module)
    vi.mocked(WebAssembly.instantiate).mockResolvedValueOnce({} as WebAssembly.Instance)

    const { load, instance } = useWebAssembly()
    const result = await load('test.wasm')

    expect(result).toBeDefined()
    expect(instance.value).toBeDefined()
  })

  it('should handle load errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Not found'))

    const { load, error } = useWebAssembly()
    const result = await load('test.wasm')

    expect(result).toBeNull()
    expect(error.value).toBeInstanceOf(Error)
  })
})
