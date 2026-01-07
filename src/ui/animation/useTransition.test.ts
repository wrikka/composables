import { describe, it, expect, vi, afterEach } from 'vitest'
import { useTransition } from './useTransition'

vi.useFakeTimers()

describe('useTransition', () => {
  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should initialize with default values', () => {
    const { visible, transitionClass, isTransitioning } = useTransition()
    expect(visible.value).toBe(false)
    expect(transitionClass.value).toBe('')
    expect(isTransitioning.value).toBe(false)
  })

  it('should handle enter transition', async () => {
    const { visible, transitionClass, isTransitioning, enter } = useTransition(false, { duration: 500 })

    enter()
    await vi.runOnlyPendingTimersAsync()

    expect(visible.value).toBe(true)
    expect(isTransitioning.value).toBe(true)
    // Classes are applied in next animation frame, which is hard to test precisely with fake timers.
    // We'll focus on the state changes.

    await vi.advanceTimersByTimeAsync(500)

    expect(isTransitioning.value).toBe(false)
    expect(transitionClass.value).toBe('')
  })

  it('should handle leave transition', async () => {
    const { visible, transitionClass, isTransitioning, leave } = useTransition(true, { duration: 500 })

    leave()
    await vi.runOnlyPendingTimersAsync()

    expect(visible.value).toBe(false)
    expect(isTransitioning.value).toBe(true)

    await vi.advanceTimersByTimeAsync(500)

    expect(isTransitioning.value).toBe(false)
    expect(transitionClass.value).toBe('')
  })

  it('should toggle visibility', async () => {
    const { visible, toggle } = useTransition(false)

    toggle()
    expect(visible.value).toBe(true)

    await vi.runOnlyPendingTimersAsync()
    await vi.advanceTimersByTimeAsync(300) // default duration

    toggle()
    expect(visible.value).toBe(false)
  })
})
