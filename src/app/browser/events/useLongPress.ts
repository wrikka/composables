import { useLongPress as useVueUseLongPress, type UseLongPressReturn } from '@vueuse/core'
import { Ref } from 'vue'

export interface UseLongPressOptions {
  delay?: number
  modifiers?: Array<'prevent' | 'stop' | 'self' | 'exact'>
  onStart?: (e: PointerEvent) => void
  onEnd?: (e: PointerEvent, pressed: boolean) => void
}

export function useLongPress(
  target: Ref<HTMLElement | undefined> | HTMLElement,
  options: UseLongPressOptions = {},
): UseLongPressReturn {
  return useVueUseLongPress(target, options)
}
