import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useFlip } from './useFlip'

const mockAnimate = vi.fn()
window.HTMLElement.prototype.animate = mockAnimate

describe('useFlip', () => {
  beforeEach(() => {
    mockAnimate.mockClear()
  })

  it('should apply inverted transform to animate element', async () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')
    const elements = ref<HTMLElement[]>([el1, el2])

    const { play } = useFlip(elements, { duration: 1000, easing: 'ease-out' })

    // Mock initial positions
    vi.spyOn(el1, 'getBoundingClientRect').mockReturnValue({ top: 0, left: 0, width: 100, height: 100 } as DOMRect)
    vi.spyOn(el2, 'getBoundingClientRect').mockReturnValue({ top: 0, left: 110, width: 100, height: 100 } as DOMRect)

    // First state
    await play()

    // No animation on first play
    expect(mockAnimate).not.toHaveBeenCalled()

    // Mock new positions (elements swapped)
    vi.spyOn(el1, 'getBoundingClientRect').mockReturnValue({ top: 0, left: 110, width: 100, height: 100 } as DOMRect)
    vi.spyOn(el2, 'getBoundingClientRect').mockReturnValue({ top: 0, left: 0, width: 100, height: 100 } as DOMRect)

    // Second state -> play animation
    await play()

    expect(mockAnimate).toHaveBeenCalledTimes(2)

    // el1 moved from left: 0 to left: 110, so dx is -110
    expect(mockAnimate).toHaveBeenCalledWith(
      [
        { transform: 'translate(-110px, 0px) scale(1, 1)' },
        { transform: 'none' },
      ],
      { duration: 1000, easing: 'ease-out' }
    )

    // el2 moved from left: 110 to left: 0, so dx is 110
    expect(mockAnimate).toHaveBeenCalledWith(
      [
        { transform: 'translate(110px, 0px) scale(1, 1)' },
        { transform: 'none' },
      ],
      { duration: 1000, easing: 'ease-out' }
    )
  })
})
