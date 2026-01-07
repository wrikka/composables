import { ref } from 'vue'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useElementBounding } from './useElementBounding'

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(_callback: ResizeObserverCallback) {}
}

global.ResizeObserver = MockResizeObserver as any

describe('useElementBounding', () => {
  const mockRect = {
    height: 100,
    width: 200,
    top: 50,
    left: 75,
    right: 275,
    bottom: 150,
    x: 75,
    y: 50,
    toJSON: () => JSON.stringify(this),
  }

  const target = ref<HTMLElement | null>(document.createElement('div'))
  vi.spyOn(target.value!, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect)

  afterEach(() => {
    target.value = document.createElement('div')
    vi.spyOn(target.value!, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect)
  })

  it('should return initial bounding values', () => {
    const { height, width, top, left, right, bottom, x, y } = useElementBounding(target)

    expect(height.value).toBe(mockRect.height)
    expect(width.value).toBe(mockRect.width)
    expect(top.value).toBe(mockRect.top)
    expect(left.value).toBe(mockRect.left)
    expect(right.value).toBe(mockRect.right)
    expect(bottom.value).toBe(mockRect.bottom)
    expect(x.value).toBe(mockRect.x)
    expect(y.value).toBe(mockRect.y)
  })

  it('should not update if target is null', () => {
    target.value = null
    const { height, width } = useElementBounding(target)
    expect(height.value).toBe(0)
    expect(width.value).toBe(0)
  })

  it('should call update when update function is called', () => {
    const { update } = useElementBounding(target)
    const spy = vi.spyOn(target.value!, 'getBoundingClientRect')
    update()
    expect(spy).toHaveBeenCalled()
  })
})
