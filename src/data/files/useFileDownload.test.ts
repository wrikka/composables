import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'
import { useFileDownload } from './useFileDownload'

// Mock fetch and URL.createObjectURL
global.fetch = vi.fn()
window.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-url')
window.URL.revokeObjectURL = vi.fn()

describe('useFileDownload', () => {
  afterEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('should download a file successfully', async () => {
    const mockBlob = new Blob(['test content'], { type: 'text/plain' })
    ;(fetch as Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    })

    const { download, isDownloading, error } = useFileDownload()
    const linkClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await download('http://example.com/file.txt', { fileName: 'custom.txt' })

    expect(isDownloading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(fetch).toHaveBeenCalledWith('http://example.com/file.txt')
    expect(linkClickSpy).toHaveBeenCalled()
    expect(document.querySelector('a')?.download).toBe('custom.txt')

    linkClickSpy.mockRestore()
  })

  it('should handle fetch error', async () => {
    ;(fetch as Mock).mockResolvedValue({ ok: false, status: 404 })

    const { download, isDownloading, error } = useFileDownload()
    await download('http://example.com/not-found.txt')

    expect(isDownloading.value).toBe(false)
    expect(error.value).toBeInstanceOf(Error)
    expect((error.value as Error).message).toContain('404')
  })
})
