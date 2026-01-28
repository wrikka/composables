import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFileHandling } from './useFileHandling'

describe('useFileHandling', () => {
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

  it('should open file dialog', async () => {
    const { open, isOpening } = useFileHandling()
    
    vi.mocked(document.createElement).mockReturnValueOnce({
      click: vi.fn(),
      onchange: null,
      oncancel: null,
    } as any)

    await open()

    expect(isOpening.value).toBe(false)
  })

  it('should save file', async () => {
    const { save, isSaving } = useFileHandling()
    await save('test content', 'test.txt')

    expect(isSaving.value).toBe(false)
  })

  it('should handle save errors', async () => {
    vi.stubGlobal('Blob', class {
      constructor() {
        throw new Error('Blob creation failed')
      }
    })

    const { save, error } = useFileHandling()
    await save('test content', 'test.txt')

    expect(error.value).toBeInstanceOf(Error)
  })
})
