import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useIdle } from './useIdle'

describe('useIdle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('should initialize with default values', () => {
    const { idle, lastActive } = useIdle()

    expect(idle.value).toBe(false)
    expect(lastActive.value).toBeTypeOf('number')
  })

  it('should initialize with custom initial state', () => {
    const { idle } = useIdle({ initialState: true })

    expect(idle.value).toBe(true)
  })

  it('should become idle after timeout', () => {
    const { idle } = useIdle({ timeout: 1000 })

    expect(idle.value).toBe(false)

    vi.advanceTimersByTime(1000)
    expect(idle.value).toBe(true)
  })

  it('should reset idle state on activity', () => {
    const { idle } = useIdle({ timeout: 1000 })

    vi.advanceTimersByTime(500)
    expect(idle.value).toBe(false)

    // Simulate user activity
    document.dispatchEvent(new MouseEvent('mousedown'))
    expect(idle.value).toBe(false)

    vi.advanceTimersByTime(1000)
    expect(idle.value).toBe(true)
  })

  it('should handle multiple events', () => {
    const { idle } = useIdle({ timeout: 1000 })

    document.dispatchEvent(new KeyboardEvent('keypress'))
    document.dispatchEvent(new Event('scroll'))
    document.dispatchEvent(new TouchEvent('touchstart'))
    document.dispatchEvent(new Event('click'))

    vi.advanceTimersByTime(1000)
    expect(idle.value).toBe(true)

    document.dispatchEvent(new MouseEvent('mousemove'))
    expect(idle.value).toBe(false)
  })

  it('should update last active time', () => {
    const { lastActive } = useIdle({ timeout: 1000 })

    const initialTime = lastActive.value
    vi.advanceTimersByTime(100)

    document.dispatchEvent(new MouseEvent('mousedown'))
    expect(lastActive.value).toBeGreaterThan(initialTime)
  })

  it('should start manually', () => {
    const { idle, start } = useIdle({ initialState: true, timeout: 1000 })

    expect(idle.value).toBe(true)

    start()
    expect(idle.value).toBe(false)

    vi.advanceTimersByTime(1000)
    expect(idle.value).toBe(true)
  })

  it('should stop manually', () => {
    const { idle, stop } = useIdle({ timeout: 1000 })

    expect(idle.value).toBe(false)

    stop()
    vi.advanceTimersByTime(1000)
    expect(idle.value).toBe(false) // Should not become idle when stopped
  })

  it('should reset state', () => {
    const { idle, reset } = useIdle({ timeout: 1000 })

    vi.advanceTimersByTime(1000)
    expect(idle.value).toBe(true)

    reset()
    expect(idle.value).toBe(false)
  })

  it('should use custom timeout', () => {
    const { idle } = useIdle({ timeout: 500 })

    vi.advanceTimersByTime(499)
    expect(idle.value).toBe(false)

    vi.advanceTimersByTime(1)
    expect(idle.value).toBe(true)
  })

  it('should use custom events', () => {
    const { idle } = useIdle({ 
      timeout: 1000,
      events: ['custom-event']
    })

    document.dispatchEvent(new Event('mousedown')) // Not in custom events
    vi.advanceTimersByTime(1000)
    expect(idle.value).toBe(true)

    document.dispatchEvent(new Event('custom-event'))
    expect(idle.value).toBe(false)
  })
})
