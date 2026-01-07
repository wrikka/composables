import { ref } from 'vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFullscreen } from './useFullscreen'

describe('useFullscreen', () => {
  const requestFullscreen = vi.fn()
  const exitFullscreen = vi.fn()

  const el = ref(document.createElement('div'))
  Object.defineProperty(el.value, 'requestFullscreen', { value: requestFullscreen })
  Object.defineProperty(document, 'exitFullscreen', { value: exitFullscreen })
  Object.defineProperty(document, 'fullscreenEnabled', { value: true, writable: true })
  Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true })

  beforeEach(() => {
    requestFullscreen.mockClear()
    exitFullscreen.mockClear()
    vi.spyOn(document, 'fullscreenElement', 'get').mockReturnValue(null)
  })

  it('should request fullscreen', async () => {
    const { enter } = useFullscreen(el)
    await enter()
    expect(requestFullscreen).toHaveBeenCalled()
  })

  it('should exit fullscreen', async () => {
    const { exit } = useFullscreen(el)
    await exit()
    expect(exitFullscreen).toHaveBeenCalled()
  })

  it('should toggle fullscreen', async () => {
    const { toggle, isFullscreen } = useFullscreen(el)

    await toggle()
    expect(requestFullscreen).toHaveBeenCalledTimes(1)

    vi.spyOn(document, 'fullscreenElement', 'get').mockReturnValue(el.value)
    document.dispatchEvent(new Event('fullscreenchange'))
    expect(isFullscreen.value).toBe(true)

    await toggle()
    expect(exitFullscreen).toHaveBeenCalledTimes(1)
  })
})
