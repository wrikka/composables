import { ref, computed, type Ref, type MaybeRef } from 'vue'
import { useRafFn } from './useRafFn'
import { linear, type EasingFunction } from './easing'

function parseColor(color: string): [number, number, number] {
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    if (hex.length === 3) {
      return [
        parseInt(hex[0]! + hex[0]!, 16),
        parseInt(hex[1]! + hex[1]!, 16),
        parseInt(hex[2]! + hex[2]!, 16),
      ]
    }
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ]
    }
  }
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]!), parseInt(rgbMatch[2]!), parseInt(rgbMatch[3]!)]
  }
  return [0, 0, 0]
}

export interface UseColorOptions {
  duration?: number
  easing?: EasingFunction
  immediate?: boolean
}

export function useColor(
  from: MaybeRef<string>,
  to: MaybeRef<string>,
  options: UseColorOptions = {}
): Ref<string> {
  const { duration = 1000, easing = linear, immediate = true } = options

  const fromRgb = computed(() => parseColor(ref(from).value))
  const toRgb = computed(() => parseColor(ref(to).value))

  const r = ref(fromRgb.value[0])
  const g = ref(fromRgb.value[1])
  const b = ref(fromRgb.value[2])

  let startTime: number | null = null

  const { resume, pause } = useRafFn(
    (timestamp) => {
      if (startTime === null) startTime = timestamp

      const elapsedTime = timestamp - startTime
      const progress = Math.min(1, elapsedTime / duration)
      const easedProgress = easing(progress)

      r.value = fromRgb.value[0] + (toRgb.value[0] - fromRgb.value[0]) * easedProgress
      g.value = fromRgb.value[1] + (toRgb.value[1] - fromRgb.value[1]) * easedProgress
      b.value = fromRgb.value[2] + (toRgb.value[2] - fromRgb.value[2]) * easedProgress

      if (progress >= 1) {
        pause()
      }
    },
    { immediate: false }
  )

  if (immediate) {
    resume()
  }

  return computed(() => `rgb(${Math.round(r.value)}, ${Math.round(g.value)}, ${Math.round(b.value)})`)
}
