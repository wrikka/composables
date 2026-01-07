import { ref, unref, watch, type MaybeRef } from 'vue'

export type TimelineSegment = {
  animation: Animation
  start: number
  end: number
}

export function useTimeline(segments: MaybeRef<TimelineSegment[]>) {
  const duration = ref(0)
  const currentTime = ref(0)
  const isPlaying = ref(false)

  let rafId: number | null = null
  let lastTimestamp: number | null = null

  const updateDuration = () => {
    duration.value = unref(segments).reduce((max, s) => Math.max(max, s.end), 0)
  }

  const seek = (time: number) => {
    currentTime.value = Math.max(0, Math.min(time, duration.value))
    unref(segments).forEach(({ animation, start, end }) => {
      const localTime = currentTime.value - start
      animation.currentTime = Math.max(0, Math.min(localTime, end - start))
    })
  }

  const loop = (timestamp: number) => {
    if (!isPlaying.value) {
      lastTimestamp = null
      return
    }

    if (lastTimestamp === null) lastTimestamp = timestamp
    const delta = timestamp - lastTimestamp
    lastTimestamp = timestamp

    if (currentTime.value >= duration.value) {
      pause()
      return
    }

    seek(currentTime.value + delta)
    rafId = window.requestAnimationFrame(loop)
  }

  const play = () => {
    if (isPlaying.value) return
    isPlaying.value = true
    rafId = window.requestAnimationFrame(loop)
  }

  const pause = () => {
    isPlaying.value = false
    if (rafId) {
      window.cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  const reset = () => {
    pause()
    seek(0)
  }

  watch(
    () => unref(segments),
    () => {
      updateDuration()
      seek(currentTime.value)
    },
    { immediate: true, deep: true }
  )

  return { currentTime, duration, isPlaying, play, pause, seek, reset }
}
