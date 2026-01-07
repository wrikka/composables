import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useTimeline, type TimelineSegment } from './useTimeline'

vi.useFakeTimers()

// Mock Animation object
class MockAnimation {
  currentTime = 0
}

describe('useTimeline', () => {
  const createMockSegment = (start: number, end: number): TimelineSegment => ({
    animation: new MockAnimation() as unknown as Animation,
    start,
    end,
  })

  it('should calculate the total duration correctly', () => {
    const segments = ref([
      createMockSegment(0, 1000),
      createMockSegment(500, 2000),
      createMockSegment(1500, 3000),
    ])
    const { duration } = useTimeline(segments)
    expect(duration.value).toBe(3000)
  })

  it('should seek all animations to the correct local time', () => {
    const segments = ref([
      createMockSegment(0, 1000),
      createMockSegment(1000, 2000),
    ])
    const { seek } = useTimeline(segments)

    seek(1500)

    expect(segments.value[0]).toBeDefined();
    expect(segments.value[0]!.animation.currentTime).toBe(1000); // At its end

    expect(segments.value[1]).toBeDefined();
    expect(segments.value[1]!.animation.currentTime).toBe(500);  // Halfway through
  })

  it('should play and update currentTime', () => {
    const segments = ref([createMockSegment(0, 1000)])
    const { play, currentTime } = useTimeline(segments)

    play()
    vi.advanceTimersByTime(500)

    expect(currentTime.value).toBe(500)
  })

  it('should pause the timeline', () => {
    const segments = ref([createMockSegment(0, 1000)])
    const { play, pause, currentTime } = useTimeline(segments)

    play()
    vi.advanceTimersByTime(300)
    pause()
    vi.advanceTimersByTime(500)

    expect(currentTime.value).toBe(300)
  })

  it('should reset the timeline', () => {
    const segments = ref([createMockSegment(0, 1000)])
    const { play, reset, currentTime, isPlaying } = useTimeline(segments)

    play()
    vi.advanceTimersByTime(500)
    reset()

    expect(currentTime.value).toBe(0)
    expect(isPlaying.value).toBe(false)
    expect(segments.value[0]).toBeDefined();
    expect(segments.value[0]!.animation.currentTime).toBe(0);
  })
})
