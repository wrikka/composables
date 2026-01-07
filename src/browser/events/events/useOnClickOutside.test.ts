import { describe, it, expect, beforeEach, afterEach, vi, type MockedFunction } from 'vitest'
import { useOnClickOutside } from './useOnClickOutside'

describe('useOnClickOutside', () => {
  let targetElement: HTMLElement
  let outsideElement: HTMLElement
  let ignoreElement: HTMLElement
  let callback: MockedFunction<(event: MouseEvent) => void>

  beforeEach(() => {
    targetElement = document.createElement('div')
    outsideElement = document.createElement('div')
    ignoreElement = document.createElement('div')
    callback = vi.fn()

    document.body.appendChild(targetElement)
    document.body.appendChild(outsideElement)
    document.body.appendChild(ignoreElement)
  })

  afterEach(() => {
    document.body.removeChild(targetElement)
    document.body.removeChild(outsideElement)
    document.body.removeChild(ignoreElement)
  })

  it('should initialize as active', () => {
    const { isActive } = useOnClickOutside(targetElement, callback)
    expect(isActive.value).toBe(true)
  })

  it('should call callback when clicking outside', () => {
    useOnClickOutside(targetElement, callback)

    const clickEvent = new MouseEvent('click', { bubbles: true })
    outsideElement.dispatchEvent(clickEvent)

    expect(callback).toHaveBeenCalledWith(clickEvent)
  })

  it('should not call callback when clicking inside', () => {
    useOnClickOutside(targetElement, callback)

    const clickEvent = new MouseEvent('click', { bubbles: true })
    targetElement.dispatchEvent(clickEvent)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should ignore clicks on specified elements', () => {
    useOnClickOutside(targetElement, callback, {
      ignore: [ignoreElement]
    })

    const clickEvent = new MouseEvent('click', { bubbles: true })
    ignoreElement.dispatchEvent(clickEvent)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should ignore clicks on specified selectors', () => {
    ignoreElement.classList.add('ignore-me')
    document.body.appendChild(ignoreElement)

    useOnClickOutside(targetElement, callback, {
      ignore: ['.ignore-me']
    })

    const clickEvent = new MouseEvent('click', { bubbles: true })
    ignoreElement.dispatchEvent(clickEvent)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should work with function target', () => {
    const getTarget = vi.fn().mockReturnValue(targetElement)
    useOnClickOutside(getTarget, callback)

    const clickEvent = new MouseEvent('click', { bubbles: true })
    outsideElement.dispatchEvent(clickEvent)

    expect(callback).toHaveBeenCalledWith(clickEvent)
    expect(getTarget).toHaveBeenCalled()
  })

  it('should handle activation and deactivation', () => {
    const { isActive, deactivate, activate } = useOnClickOutside(targetElement, callback)

    deactivate()
    expect(isActive.value).toBe(false)

    const clickEvent = new MouseEvent('click', { bubbles: true })
    outsideElement.dispatchEvent(clickEvent)
    expect(callback).not.toHaveBeenCalled()

    activate()
    expect(isActive.value).toBe(true)

    outsideElement.dispatchEvent(clickEvent)
    expect(callback).toHaveBeenCalled()
  })
})
