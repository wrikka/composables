import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClipboard } from './useClipboard'

const writeText = vi.fn()

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText,
  },
  writable: true,
})

describe('useClipboard', () => {
  beforeEach(() => {
    writeText.mockClear()
  })

  it('should call navigator.clipboard.writeText', async () => {
    const { copy } = useClipboard()
    const textToCopy = 'Hello, world!'

    await copy(textToCopy)

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText).toHaveBeenCalledWith(textToCopy)
  })

  it('should update copied state', async () => {
    vi.useFakeTimers()
    const { copy, copied } = useClipboard()

    expect(copied.value).toBe(false)

    await copy('test')

    expect(copied.value).toBe(true)

    vi.advanceTimersByTime(1500)

    expect(copied.value).toBe(false)
    vi.useRealTimers()
  })
})
