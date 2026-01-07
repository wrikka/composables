import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useIntersectionObserver, useIntersectionObserverMultiple, useLazyLoad } from './useIntersectionObserver'

describe('useIntersectionObserver', () => {
  let mockElement: Element
  let mockObserver: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as any

    mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }

    vi.stubGlobal('IntersectionObserver', vi.fn(() => mockObserver))
  })

  it('should initialize with default values', () => {
    const { isSupported, isIntersecting, intersectionRatio, targetElement, entries } = useIntersectionObserver(mockElement)

    expect(isSupported.value).toBe(true)
    expect(isIntersecting.value).toBe(false)
    expect(intersectionRatio.value).toBe(0)
    expect(targetElement.value).toBe(mockElement)
    expect(entries.value).toEqual([])
  })

  it('should handle unsupported browser', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    const { isSupported } = useIntersectionObserver(mockElement)

    expect(isSupported.value).toBe(false)

    vi.unstubAllGlobals()
  })

  it('should use custom options', () => {
    const options = {
      threshold: 0.5,
      root: document.body,
      rootMargin: '10px'
    }

    useIntersectionObserver(mockElement, options)

    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      options
    )
  })

  it('should handle intersection change', () => {
    const { isIntersecting, intersectionRatio } = useIntersectionObserver(mockElement)

    const mockEntry = {
      target: mockElement,
      isIntersecting: true,
      intersectionRatio: 0.75
    }

    const callback = (IntersectionObserver as any).mock.calls[0][0]
    callback([mockEntry])

    expect(isIntersecting.value).toBe(true)
    expect(intersectionRatio.value).toBe(0.75)
  })

  it('should handle multiple entries', () => {
    const { isIntersecting, intersectionRatio } = useIntersectionObserver(mockElement)

    const mockEntry1 = {
      target: document.createElement('div'),
      isIntersecting: false,
      intersectionRatio: 0
    }

    const mockEntry2 = {
      target: mockElement,
      isIntersecting: true,
      intersectionRatio: 0.5
    }

    const callback = (IntersectionObserver as any).mock.calls[0][0]
    callback([mockEntry1, mockEntry2])

    expect(isIntersecting.value).toBe(true)
    expect(intersectionRatio.value).toBe(0.5)
  })

  it('should stop observing', () => {
    const { stop, isIntersecting, intersectionRatio } = useIntersectionObserver(mockElement)

    stop()

    expect(mockObserver.disconnect).toHaveBeenCalled()
    expect(isIntersecting.value).toBe(false)
    expect(intersectionRatio.value).toBe(0)
  })

  it('should pause and resume observing', () => {
    const { pause, resume } = useIntersectionObserver(mockElement)

    pause()
    expect(mockObserver.unobserve).toHaveBeenCalledWith(mockElement)

    resume()
    expect(mockObserver.observe).toHaveBeenCalledWith(mockElement)
  })

  it('should update options and restart', () => {
    const { updateOptions } = useIntersectionObserver(mockElement)

    updateOptions({ threshold: 0.8 })

    expect(mockObserver.disconnect).toHaveBeenCalled()
    expect(IntersectionObserver).toHaveBeenCalledTimes(2)
  })

  it('should handle ref target', () => {
    const targetRef = ref(mockElement)
    const { targetElement } = useIntersectionObserver(targetRef)

    expect(targetElement.value).toBe(mockElement)
  })

  it('should handle function target', () => {
    const targetFn = () => mockElement
    const { targetElement } = useIntersectionObserver(targetFn)

    expect(targetElement.value).toBe(mockElement)
  })

  it('should handle null target', () => {
    const { targetElement } = useIntersectionObserver(null as any)

    expect(targetElement.value).toBe(null)
    expect(mockObserver.observe).not.toHaveBeenCalled()
  })
})

describe('useIntersectionObserverMultiple', () => {
  let mockElements: Element[]
  let mockObserver: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockElements = [
      document.createElement('div'),
      document.createElement('span')
    ]

    mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }

    vi.stubGlobal('IntersectionObserver', vi.fn(() => mockObserver))
  })

  it('should initialize with default values', () => {
    const { isSupported, results, entries } = useIntersectionObserverMultiple(mockElements)

    expect(isSupported.value).toBe(true)
    expect(results.value.size).toBe(0)
    expect(entries.value).toEqual([])
  })

  it('should observe multiple elements', () => {
    useIntersectionObserverMultiple(mockElements)

    expect(mockObserver.observe).toHaveBeenCalledTimes(2)
    expect(mockObserver.observe).toHaveBeenCalledWith(mockElements[0])
    expect(mockObserver.observe).toHaveBeenCalledWith(mockElements[1])
  })

  it('should track results for multiple elements', () => {
    const { results, getResult, isIntersecting, getIntersectionRatio } = useIntersectionObserverMultiple(mockElements)

    const mockEntry1 = {
      target: mockElements[0],
      isIntersecting: true,
      intersectionRatio: 0.8
    }

    const mockEntry2 = {
      target: mockElements[1],
      isIntersecting: false,
      intersectionRatio: 0.2
    }

    const callback = (IntersectionObserver as any).mock.calls[0][0]
    callback([mockEntry1, mockEntry2])

    expect(results.value.size).toBe(2)
    expect(getResult(mockElements[0]!)?.isIntersecting).toBe(true)
    expect(getResult(mockElements[1]!)?.isIntersecting).toBe(false)
    expect(isIntersecting(mockElements[0]!)).toBe(true)
    expect(isIntersecting(mockElements[1]!)).toBe(false)
    expect(getIntersectionRatio(mockElements[0]!)).toBe(0.8)
    expect(getIntersectionRatio(mockElements[1]!)).toBe(0.2)
  })

  it('should filter out null elements', () => {
    const targets = [mockElements[0], null, mockElements[1]]
    
    useIntersectionObserverMultiple(targets as any)

    expect(mockObserver.observe).toHaveBeenCalledTimes(2)
  })

  it('should stop observing all elements', () => {
    const { stop, results } = useIntersectionObserverMultiple(mockElements)

    stop()

    expect(mockObserver.disconnect).toHaveBeenCalled()
    expect(results.value.size).toBe(0)
  })
})

describe('useLazyLoad', () => {
  let mockElement: Element
  let mockObserver: any
  let mockCallback: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockElement = document.createElement('div')
    mockCallback = vi.fn()

    mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }

    vi.stubGlobal('IntersectionObserver', vi.fn(() => mockObserver))
  })

  it('should initialize with default values', () => {
    const { isIntersecting, hasTriggered } = useLazyLoad(mockElement, mockCallback)

    expect(isIntersecting.value).toBe(false)
    expect(hasTriggered.value).toBe(false)
  })

  it('should trigger callback when element intersects', () => {
    const { hasTriggered } = useLazyLoad(mockElement, mockCallback)

    const mockEntry = {
      target: mockElement,
      isIntersecting: true,
      intersectionRatio: 0.5
    }

    const callback = (IntersectionObserver as any).mock.calls[0][0]
    callback([mockEntry])

    expect(hasTriggered.value).toBe(true)
    expect(mockCallback).toHaveBeenCalledWith(mockEntry)
    expect(mockObserver.disconnect).toHaveBeenCalled()
  })

  it('should not trigger callback multiple times', () => {
    const { hasTriggered } = useLazyLoad(mockElement, mockCallback)

    const mockEntry = {
      target: mockElement,
      isIntersecting: true,
      intersectionRatio: 0.5
    }

    const callback = (IntersectionObserver as any).mock.calls[0][0]
    callback([mockEntry])
    callback([mockEntry]) // Second intersection

    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(hasTriggered.value).toBe(true)
  })

  it('should reset and trigger again', () => {
    const { hasTriggered, reset } = useLazyLoad(mockElement, mockCallback)

    // First intersection
    const mockEntry = {
      target: mockElement,
      isIntersecting: true,
      intersectionRatio: 0.5
    }

    const callback = (IntersectionObserver as any).mock.calls[0][0]
    callback([mockEntry])

    expect(hasTriggered.value).toBe(true)
    expect(mockCallback).toHaveBeenCalledTimes(1)

    // Reset and trigger again
    reset()
    expect(hasTriggered.value).toBe(false)

    callback([mockEntry])
    expect(mockCallback).toHaveBeenCalledTimes(2)
  })

  it('should use custom options', () => {
    const options = {
      threshold: 0.8,
      rootMargin: '20px'
    }

    useLazyLoad(mockElement, mockCallback, options)

    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.8, rootMargin: '20px' }
    )
  })

  it('should not trigger if not intersecting', () => {
    const { hasTriggered } = useLazyLoad(mockElement, mockCallback)

    const mockEntry = {
      target: mockElement,
      isIntersecting: false,
      intersectionRatio: 0
    }

    const callback = (IntersectionObserver as any).mock.calls[0][0]
    callback([mockEntry])

    expect(hasTriggered.value).toBe(false)
    expect(mockCallback).not.toHaveBeenCalled()
  })
})
