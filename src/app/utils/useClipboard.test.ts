import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useClipboard } from './useClipboard'

describe('useClipboard', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn(),
        readText: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should copy text to clipboard', async () => {
    const { copy, text } = useClipboard()
    await copy('test')

    expect(text.value).toBe('test')
  })

  it('should paste text from clipboard', async () => {
    vi.mocked(navigator.clipboard.readText).mockResolvedValueOnce('test')

    const { paste, text } = useClipboard()
    await paste()

    expect(text.value).toBe('test')
  })

  it('should clear clipboard text', async () => {
    const { copy, clear, text } = useClipboard()
    await copy('test')
    clear()

    expect(text.value).toBeNull()
  })
})
