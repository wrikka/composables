import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useHotkey } from './useHotkey'

describe('useHotkey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty bindings', () => {
    const { bindings, isEnabled } = useHotkey()

    expect(bindings.value.size).toBe(0)
    expect(isEnabled.value).toBe(true)
  })

  it('should add hotkey', () => {
    const { addHotkey, hasHotkey } = useHotkey()
    const handler = vi.fn()

    addHotkey('a', handler)

    expect(hasHotkey('a')).toBe(true)
    expect(hasHotkey('b')).toBe(false)
  })

  it('should handle hotkey press', () => {
    const { addHotkey } = useHotkey()
    const handler = vi.fn()

    addHotkey('a', handler)

    // Simulate key press
    const event = new KeyboardEvent('keydown', { key: 'a' })
    document.dispatchEvent(event)

    expect(handler).toHaveBeenCalledWith(event)
  })

  it('should handle modifier keys', () => {
    const { addHotkey } = useHotkey()
    const handler = vi.fn()

    addHotkey('ctrl+a', handler)

    const event = new KeyboardEvent('keydown', { 
      key: 'a', 
      ctrlKey: true 
    })
    document.dispatchEvent(event)

    expect(handler).toHaveBeenCalledWith(event)
  })

  it('should handle multiple modifiers', () => {
    const { addHotkey } = useHotkey()
    const handler = vi.fn()

    addHotkey('ctrl+shift+a', handler)

    const event = new KeyboardEvent('keydown', { 
      key: 'a', 
      ctrlKey: true,
      shiftKey: true 
    })
    document.dispatchEvent(event)

    expect(handler).toHaveBeenCalledWith(event)
  })

  it('should handle special keys', () => {
    const { addHotkey } = useHotkey()
    const handler = vi.fn()

    addHotkey('space', handler)

    const event = new KeyboardEvent('keydown', { key: ' ' })
    document.dispatchEvent(event)

    expect(handler).toHaveBeenCalledWith(event)
  })

  it('should handle escape key', () => {
    const { addHotkey } = useHotkey()
    const handler = vi.fn()

    addHotkey('esc', handler)

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(event)

    expect(handler).toHaveBeenCalledWith(event)
  })

  it('should prevent default by default', () => {
    const { addHotkey } = useHotkey()
    const handler = vi.fn()

    addHotkey('a', handler)

    const event = new KeyboardEvent('keydown', { key: 'a', cancelable: true })
    document.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })

  it('should respect preventDefault option', () => {
    const { addHotkey } = useHotkey()
    const handler = vi.fn()

    addHotkey('a', handler, { preventDefault: false })

    const event = new KeyboardEvent('keydown', { key: 'a', cancelable: true })
    document.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
  })

  it('should handle stopPropagation option', () => {
    const { addHotkey } = useHotkey()
    const handler = vi.fn()

    addHotkey('a', handler, { stopPropagation: true })

    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true })
    document.dispatchEvent(event)

    expect(event.stopPropagation).toHaveBeenCalled()
  })

  it('should handle multiple handlers for same key', () => {
    const { addHotkey } = useHotkey()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    addHotkey('a', handler1)
    addHotkey('a', handler2)

    const event = new KeyboardEvent('keydown', { key: 'a' })
    document.dispatchEvent(event)

    expect(handler1).toHaveBeenCalled()
    expect(handler2).toHaveBeenCalled()
  })

  it('should remove specific handler', () => {
    const { addHotkey, removeHotkey, hasHotkey } = useHotkey()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    addHotkey('a', handler1)
    addHotkey('a', handler2)
    expect(hasHotkey('a')).toBe(true)

    removeHotkey('a', handler1)
    expect(hasHotkey('a')).toBe(true) // Still has handler2

    const event = new KeyboardEvent('keydown', { key: 'a' })
    document.dispatchEvent(event)

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalled()
  })

  it('should remove all handlers for key', () => {
    const { addHotkey, removeHotkey, hasHotkey } = useHotkey()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    addHotkey('a', handler1)
    addHotkey('a', handler2)
    expect(hasHotkey('a')).toBe(true)

    removeHotkey('a')
    expect(hasHotkey('a')).toBe(false)

    const event = new KeyboardEvent('keydown', { key: 'a' })
    document.dispatchEvent(event)

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })

  it('should clear all hotkeys', () => {
    const { addHotkey, clearHotkeys, getHotkeys } = useHotkey()

    addHotkey('a', vi.fn())
    addHotkey('b', vi.fn())
    addHotkey('ctrl+c', vi.fn())

    expect(getHotkeys()).toHaveLength(3)

    clearHotkeys()
    expect(getHotkeys()).toHaveLength(0)
  })

  it('should enable and disable hotkeys', () => {
    const { addHotkey, enable, disable, isEnabled } = useHotkey()
    const handler = vi.fn()

    addHotkey('a', handler)

    disable()
    expect(isEnabled.value).toBe(false)

    const event = new KeyboardEvent('keydown', { key: 'a' })
    document.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()

    enable()
    expect(isEnabled.value).toBe(true)

    document.dispatchEvent(event)
    expect(handler).toHaveBeenCalled()
  })

  it('should toggle hotkeys', () => {
    const { toggle, isEnabled } = useHotkey()

    expect(isEnabled.value).toBe(true)

    toggle()
    expect(isEnabled.value).toBe(false)

    toggle()
    expect(isEnabled.value).toBe(true)
  })

  it('should get list of hotkeys', () => {
    const { addHotkey, getHotkeys } = useHotkey()

    addHotkey('a', vi.fn())
    addHotkey('b', vi.fn())
    addHotkey('ctrl+c', vi.fn())

    const hotkeys = getHotkeys()
    expect(hotkeys).toContain('a')
    expect(hotkeys).toContain('b')
    expect(hotkeys).toContain('ctrl+c')
    expect(hotkeys).toHaveLength(3)
  })

  it('should handle enabled option per binding', () => {
    const { addHotkey } = useHotkey()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    addHotkey('a', handler1, { enabled: false })
    addHotkey('a', handler2)

    const event = new KeyboardEvent('keydown', { key: 'a' })
    document.dispatchEvent(event)

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalled()
  })

  it('should check if hotkey is currently pressed', () => {
    const { isHotkeyPressed } = useHotkey()

    new KeyboardEvent('keydown', { 
      key: 'a', 
      ctrlKey: true,
      shiftKey: true 
    })

    expect(isHotkeyPressed('ctrl+a')).toBe(true)
    expect(isHotkeyPressed('ctrl+shift+a')).toBe(true)
    expect(isHotkeyPressed('ctrl+shift+b')).toBe(false)
    expect(isHotkeyPressed('alt+a')).toBe(false)
  })

  it('should handle case insensitive keys', () => {
    const { addHotkey, hasHotkey } = useHotkey()

    addHotkey('A', vi.fn())

    expect(hasHotkey('a')).toBe(true)
    expect(hasHotkey('A')).toBe(true)
  })

  it('should handle alternative modifier names', () => {
    const { addHotkey } = useHotkey()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    addHotkey('ctrl+a', handler1)
    addHotkey('cmd+a', handler2)

    const ctrlEvent = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true })
    const metaEvent = new KeyboardEvent('keydown', { key: 'a', metaKey: true })

    document.dispatchEvent(ctrlEvent)
    document.dispatchEvent(metaEvent)

    expect(handler1).toHaveBeenCalled()
    expect(handler2).toHaveBeenCalled()
  })
})
