import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTimer, useCountdown } from './useTimer'

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should initialize with default values', () => {
    const { time, isActive, isPaused } = useTimer()

    expect(time.value).toBe(0)
    expect(isActive.value).toBe(false)
    expect(isPaused.value).toBe(false)
  })

  it('should start timer', () => {
    const { time, isActive, isPaused, start } = useTimer()

    start()
    expect(isActive.value).toBe(true)
    expect(isPaused.value).toBe(false)

    vi.advanceTimersByTime(1000)
    expect(time.value).toBe(1000)

    vi.advanceTimersByTime(1000)
    expect(time.value).toBe(2000)
  })

  it('should pause and resume timer', () => {
    const { time, isActive, isPaused, start, pause, resume } = useTimer()

    start()
    vi.advanceTimersByTime(1000)
    expect(time.value).toBe(1000)

    pause()
    expect(isActive.value).toBe(true)
    expect(isPaused.value).toBe(true)

    vi.advanceTimersByTime(1000)
    expect(time.value).toBe(1000) // Should not advance when paused

    resume()
    expect(isActive.value).toBe(true)
    expect(isPaused.value).toBe(false)

    vi.advanceTimersByTime(1000)
    expect(time.value).toBe(2000)
  })

  it('should stop timer', () => {
    const { time, isActive, isPaused, start, stop } = useTimer()

    start()
    vi.advanceTimersByTime(1000)
    expect(time.value).toBe(1000)

    stop()
    expect(isActive.value).toBe(false)
    expect(isPaused.value).toBe(false)
    expect(time.value).toBe(0)
  })

  it('should reset timer', () => {
    const { time, isActive, start, reset } = useTimer()

    start()
    vi.advanceTimersByTime(2000)
    expect(time.value).toBe(2000)

    reset()
    expect(time.value).toBe(0)
    expect(isActive.value).toBe(true) // Should restart after reset
  })

  it('should set custom time', () => {
    const { time, start, setTime } = useTimer()

    start()
    setTime(5000)
    expect(time.value).toBe(5000)

    vi.advanceTimersByTime(1000)
    expect(time.value).toBe(6000)
  })

  it('should call callback on interval', () => {
    const callback = vi.fn()
    const { start } = useTimer({ callback, interval: 500 })

    start()
    vi.advanceTimersByTime(500)
    expect(callback).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(500)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should format time correctly', () => {
    const { start, getFormattedTime } = useTimer()

    start()
    vi.advanceTimersByTime(3661000) // 1 hour, 1 minute, 1 second

    expect(getFormattedTime('seconds')).toBe('3661')
    expect(getFormattedTime('minutes:seconds')).toBe('61:01')
    expect(getFormattedTime('hours:minutes:seconds')).toBe('01:01:01')
  })

  it('should start immediately if immediate option is true', () => {
    const { isActive } = useTimer({ immediate: true })

    expect(isActive.value).toBe(true)
  })

  it('should use custom interval', () => {
    const { time, start } = useTimer({ interval: 500 })

    start()
    vi.advanceTimersByTime(500)
    expect(time.value).toBe(500)

    vi.advanceTimersByTime(500)
    expect(time.value).toBe(1000)
  })
})

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should initialize with duration', () => {
    const { remaining, isActive, isExpired } = useCountdown({ duration: 5000 })

    expect(remaining.value).toBe(5000)
    expect(isActive.value).toBe(false)
    expect(isExpired.value).toBe(false)
  })

  it('should start countdown', () => {
    const { remaining, isActive, start } = useCountdown({ duration: 5000 })

    start()
    expect(isActive.value).toBe(true)

    vi.advanceTimersByTime(1000)
    expect(remaining.value).toBe(4000)

    vi.advanceTimersByTime(1000)
    expect(remaining.value).toBe(3000)
  })

  it('should expire when reaching zero', () => {
    const onComplete = vi.fn()
    const { remaining, isActive, isExpired, start } = useCountdown({ 
      duration: 2000, 
      onComplete 
    })

    start()
    vi.advanceTimersByTime(2000)

    expect(remaining.value).toBe(0)
    expect(isActive.value).toBe(false)
    expect(isExpired.value).toBe(true)
    expect(onComplete).toHaveBeenCalled()
  })

  it('should pause and resume countdown', () => {
    const { remaining, isActive, start, pause, resume } = useCountdown({ duration: 5000 })

    start()
    vi.advanceTimersByTime(1000)
    expect(remaining.value).toBe(4000)

    pause()
    expect(isActive.value).toBe(false)

    vi.advanceTimersByTime(1000)
    expect(remaining.value).toBe(4000) // Should not advance when paused

    resume()
    expect(isActive.value).toBe(true)

    vi.advanceTimersByTime(1000)
    expect(remaining.value).toBe(3000)
  })

  it('should stop countdown', () => {
    const { remaining, isActive, start, stop } = useCountdown({ duration: 5000 })

    start()
    vi.advanceTimersByTime(1000)
    expect(remaining.value).toBe(4000)

    stop()
    expect(isActive.value).toBe(false)
    expect(remaining.value).toBe(4000) // Should keep remaining time
  })

  it('should reset countdown', () => {
    const { remaining, isActive, isExpired, start, reset } = useCountdown({ duration: 5000 })

    start()
    vi.advanceTimersByTime(3000)
    expect(remaining.value).toBe(2000)

    reset()
    expect(remaining.value).toBe(5000)
    expect(isActive.value).toBe(false)
    expect(isExpired.value).toBe(false)
  })

  it('should add time to countdown', () => {
    const { remaining, start, addTime } = useCountdown({ duration: 5000 })

    start()
    vi.advanceTimersByTime(1000)
    expect(remaining.value).toBe(4000)

    addTime(2000)
    expect(remaining.value).toBe(6000) // Should not exceed original duration

    addTime(1000)
    expect(remaining.value).toBe(5000) // Should cap at original duration
  })

  it('should subtract time from countdown', () => {
    const { remaining, start, subtractTime } = useCountdown({ duration: 5000 })

    start()
    vi.advanceTimersByTime(1000)
    expect(remaining.value).toBe(4000)

    subtractTime(2000)
    expect(remaining.value).toBe(2000)

    subtractTime(3000)
    expect(remaining.value).toBe(0)
  })

  it('should call onTick callback', () => {
    const onTick = vi.fn()
    const { start } = useCountdown({ duration: 3000, onTick, interval: 1000 })

    start()
    vi.advanceTimersByTime(1000)
    expect(onTick).toHaveBeenCalledWith(2000)

    vi.advanceTimersByTime(1000)
    expect(onTick).toHaveBeenCalledWith(1000)
  })

  it('should format countdown time', () => {
    const { getFormattedTime } = useCountdown({ duration: 3661000 })

    expect(getFormattedTime('seconds')).toBe('3661')
    expect(getFormattedTime('minutes:seconds')).toBe('61:01')
    expect(getFormattedTime('hours:minutes:seconds')).toBe('01:01:01')
  })

  it('should start immediately if immediate option is true', () => {
    const { isActive } = useCountdown({ duration: 5000, immediate: true })

    expect(isActive.value).toBe(true)
  })

  it('should use custom interval', () => {
    const { remaining, start } = useCountdown({ duration: 2000, interval: 500 })

    start()
    vi.advanceTimersByTime(500)
    expect(remaining.value).toBe(1500)

    vi.advanceTimersByTime(500)
    expect(remaining.value).toBe(1000)
  })
})
