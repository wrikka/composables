import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useScroll } from './useScroll'

describe('useScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Mock window scroll properties
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true })
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
    
    // Mock document properties
    Object.defineProperty(document.documentElement, 'scrollWidth', { value: 2000, writable: true })
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3000, writable: true })
  })

  it('should initialize with default values', () => {
    const { x, y, isScrolling, scrollDirection, arrivedState } = useScroll()

    expect(x.value).toBe(0)
    expect(y.value).toBe(0)
    expect(isScrolling.value).toBe(false)
    expect(scrollDirection.value).toBe(null)
    expect(arrivedState.value).toEqual({
      top: true,
      bottom: false,
      left: true,
      right: false
    })
  })

  it('should update scroll position on scroll', () => {
    const { y, scrollDirection } = useScroll()

    // Simulate scroll down
    window.scrollY = 100
    window.dispatchEvent(new Event('scroll'))

    expect(y.value).toBe(100)
    expect(scrollDirection.value).toBe('down')
  })

  it('should detect scroll direction', () => {
    const { scrollDirection } = useScroll()

    // Scroll down
    window.scrollY = 50
    window.dispatchEvent(new Event('scroll'))
    expect(scrollDirection.value).toBe('down')

    // Scroll up
    window.scrollY = 25
    window.dispatchEvent(new Event('scroll'))
    expect(scrollDirection.value).toBe('up')
  })

  it('should update arrived state', () => {
    const { arrivedState } = useScroll()

    // At top
    window.scrollY = 0
    window.dispatchEvent(new Event('scroll'))
    expect(arrivedState.value.top).toBe(true)
    expect(arrivedState.value.bottom).toBe(false)

    // At bottom
    window.scrollY = 2232 // 3000 - 768 = 2232
    window.dispatchEvent(new Event('scroll'))
    expect(arrivedState.value.top).toBe(false)
    expect(arrivedState.value.bottom).toBe(true)
  })

  it('should handle isScrolling state', () => {
    const { isScrolling } = useScroll()

    window.scrollY = 50
    window.dispatchEvent(new Event('scroll'))
    expect(isScrolling.value).toBe(true)

    vi.advanceTimersByTime(150)
    expect(isScrolling.value).toBe(false)
  })

  it('should provide scroll methods', () => {
    const scrollToMock = vi.fn()
    const scrollByMock = vi.fn()
    vi.stubGlobal('window', {
      scrollTo: scrollToMock,
      scrollBy: scrollByMock,
      scrollX: 0,
      scrollY: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      innerWidth: 1024,
      innerHeight: 768
    })

    const { scrollTo, scrollToX, scrollToY, scrollBy, scrollByX, scrollByY } = useScroll()

    scrollTo({ top: 100, left: 200 })
    expect(scrollToMock).toHaveBeenCalledWith({ top: 100, left: 200 })

    scrollToX(300)
    expect(scrollToMock).toHaveBeenCalledWith({ left: 300 })

    scrollToY(400)
    expect(scrollToMock).toHaveBeenCalledWith({ top: 400 })

    scrollBy({ top: 50, left: 100 })
    expect(scrollByMock).toHaveBeenCalledWith({ top: 50, left: 100 })

    scrollByX(150)
    expect(scrollByMock).toHaveBeenCalledWith({ left: 150 })

    scrollByY(250)
    expect(scrollByMock).toHaveBeenCalledWith({ top: 250 })

    vi.unstubAllGlobals()
  })

  it('should work with custom target', () => {
    const mockElement = {
      scrollLeft: 0,
      scrollTop: 0,
      scrollWidth: 1000,
      scrollHeight: 2000,
      clientWidth: 500,
      clientHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }

    const { y } = useScroll({ target: mockElement as any })

    mockElement.scrollTop = 100
    mockElement.dispatchEvent(new Event('scroll'))

    expect(y.value).toBe(100)
  })
})
