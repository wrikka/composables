import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWebCodecs } from './useWebCodecs'

describe('useWebCodecs', () => {
  beforeEach(() => {
    vi.stubGlobal('VideoEncoder', class {
      configure = vi.fn()
      encode = vi.fn()
      flush = vi.fn().mockResolvedValue(undefined)
      close = vi.fn()
    })
    vi.stubGlobal('VideoDecoder', class {
      configure = vi.fn()
      decode = vi.fn()
      flush = vi.fn().mockResolvedValue(undefined)
      close = vi.fn()
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should encode video', async () => {
    const mockFrame = { width: 1920, height: 1080 } as VideoFrame

    const { encodeVideo, isEncoding } = useWebCodecs()
    await encodeVideo(mockFrame)

    expect(isEncoding.value).toBe(false)
  })

  it('should decode video', async () => {
    const mockChunk = {} as EncodedVideoChunk

    const { decodeVideo, isDecoding } = useWebCodecs()
    await decodeVideo(mockChunk)

    expect(isDecoding.value).toBe(false)
  })

  it('should handle encoding errors', async () => {
    vi.stubGlobal('VideoEncoder', class {
      configure = vi.fn().mockImplementation(() => {
        throw new Error('Not supported')
      })
    })

    const { encodeVideo, error } = useWebCodecs()
    await encodeVideo({ width: 1920, height: 1080 } as VideoFrame)

    expect(error.value).toBeInstanceOf(Error)
  })
})
