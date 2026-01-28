import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDownload } from './useDownload'

describe('useDownload', () => {
  beforeEach(() => {
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({
        click: vi.fn(),
      })),
    })
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:https://example.com/test'),
      revokeObjectURL: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should download content', async () => {
    const { download, isDownloading } = useDownload()
    await download('test content', { filename: 'test.txt' })

    expect(isDownloading.value).toBe(false)
  })

  it('should download blob', async () => {
    const { download, isDownloading } = useDownload()
    await download(new Blob(['test']), { filename: 'test.txt' })

    expect(isDownloading.value).toBe(false)
  })
})
