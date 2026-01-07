import { ref, watch, type Ref } from 'vue'
import { useRafFn } from './useRafFn'
import { linear, type EasingFunction } from './easing'

export interface UseSvgOptions {
  duration?: number
  easing?: EasingFunction
  immediate?: boolean
}

export function useSvg(
  path: Ref<SVGPathElement | null>,
  options: UseSvgOptions = {}
) {
  const { duration = 1000, easing = linear, immediate = true } = options

  const length = ref(0)
  const progress = ref(0)

  let startTime: number | null = null

  const { resume, pause } = useRafFn(
    (timestamp) => {
      if (startTime === null) startTime = timestamp

      const elapsedTime = timestamp - startTime
      const easedProgress = easing(Math.min(1, elapsedTime / duration))

      progress.value = easedProgress

      if (path.value) {
        path.value.style.strokeDashoffset = `${length.value * (1 - progress.value)}`
      }

      if (progress.value >= 1) {
        pause()
      }
    },
    { immediate: false }
  )

  const reset = () => {
    startTime = null
    progress.value = 0
    if (path.value) {
      path.value.style.strokeDashoffset = `${length.value}`
    }
  }

  watch(
    path,
    (el) => {
      if (el) {
        length.value = el.getTotalLength()
        el.style.strokeDasharray = `${length.value}`
        reset()
        if (immediate) {
          resume()
        }
      }
    },
    { immediate: true }
  )

  return { progress, length, play: resume, pause, reset }
}
