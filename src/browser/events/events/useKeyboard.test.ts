import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useKeyboard } from './useKeyboard'

describe('useKeyboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { pressed, lastKey, ctrlPressed, shiftPressed, altPressed, metaPressed } = useKeyboard()

    expect(pressed.value).toEqual(new Set())
    expect(lastKey.value).toBe(null)
    expect(ctrlPressed.value).toBe(false)
    expect(shiftPressed.value).toBe(false)
    expect(altPressed.value).toBe(false)
    expect(metaPressed.value).toBe(false)
  })

  it('should check if key is pressed', () => {
    const { isPressed, pressed } = useKeyboard()

    pressed.value.add('a')
    expect(isPressed('a')).toBe(true)
    expect(isPressed('b')).toBe(false)
  })

  it('should check hotkey combinations', () => {
    const { isHotkey, ctrlPressed, shiftPressed, pressed } = useKeyboard()

    // Test single key
    pressed.value.add('a')
    expect(isHotkey('a')).toBe(true)

    // Test modifier combinations
    ctrlPressed.value = true
    expect(isHotkey('ctrl+a')).toBe(true)
    expect(isHotkey('control+a')).toBe(true)

    shiftPressed.value = true
    expect(isHotkey('ctrl+shift+a')).toBe(true)
  })

  it('should handle different modifier names', () => {
    const { isHotkey, metaPressed } = useKeyboard()

    metaPressed.value = true
    expect(isHotkey('meta')).toBe(true)
    expect(isHotkey('cmd')).toBe(true)
    expect(isHotkey('command')).toBe(true)
  })
})
