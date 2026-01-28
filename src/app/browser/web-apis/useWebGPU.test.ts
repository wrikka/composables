import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWebGPU } from './useWebGPU'

describe('useWebGPU', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      gpu: {
        requestAdapter: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should initialize WebGPU', async () => {
    const mockAdapter = {
      requestDevice: vi.fn().mockResolvedValue({}),
    }

    vi.mocked(navigator.gpu.requestAdapter).mockResolvedValueOnce(mockAdapter as GPUAdapter)

    const { init, device } = useWebGPU()
    const result = await init()

    expect(result).toBeDefined()
    expect(device.value).toBeDefined()
  })

  it('should handle WebGPU not supported', async () => {
    vi.stubGlobal('navigator', {})

    const { init, error } = useWebGPU()
    const result = await init()

    expect(result).toBeNull()
    expect(error.value).toBeInstanceOf(Error)
  })
})
