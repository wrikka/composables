import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useStagger } from './useStagger'

const mockAnimation = {
  play: vi.fn(),
  pause: vi.fn(),
  finish: vi.fn(),
  cancel: vi.fn(),
}

window.HTMLElement.prototype.animate = vi.fn().mockReturnValue(mockAnimation)

describe('useStagger', () => {
  const targets = ref([
    document.createElement('div'),
    document.createElement('div'),
    document.createElement('div'),
  ])
  const keyframes = [{ opacity: 0 }, { opacity: 1 }]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should apply staggered delay to animations', () => {
    const { play } = useStagger(targets, keyframes, { stagger: 150, duration: 1000 })
    play()

    expect(window.HTMLElement.prototype.animate).toHaveBeenCalledTimes(3)

    expect(window.HTMLElement.prototype.animate).toHaveBeenCalledWith(keyframes, {
      duration: 1000,
      delay: 0,
    })
    expect(window.HTMLElement.prototype.animate).toHaveBeenCalledWith(keyframes, {
      duration: 1000,
      delay: 150,
    })
    expect(window.HTMLElement.prototype.animate).toHaveBeenCalledWith(keyframes, {
      duration: 1000,
      delay: 300,
    })
  })

  it('should call pause on all animations', () => {
    const { play, pause } = useStagger(targets, keyframes)
    play()
    pause()
    expect(mockAnimation.pause).toHaveBeenCalledTimes(3)
  })

  it('should call finish on all animations', () => {
    const { play, finish } = useStagger(targets, keyframes)
    play()
    finish()
    expect(mockAnimation.finish).toHaveBeenCalledTimes(3)
  })

  it('should call cancel on all animations', () => {
    const { play, cancel } = useStagger(targets, keyframes)
    play()
    cancel()
    expect(mockAnimation.cancel).toHaveBeenCalledTimes(3)
  })
})
