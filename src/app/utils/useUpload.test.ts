import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useUpload } from './useUpload'

describe('useUpload', () => {
  beforeEach(() => {
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({
        click: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should upload files', async () => {
    const { upload, isUploading } = useUpload()
    await upload()

    expect(isUploading.value).toBe(false)
  })

  it('should clear files', () => {
    const { upload, clear, files } = useUpload()
    upload()
    clear()

    expect(files.value).toHaveLength(0)
  })
})
