import { useSwipe as useVueUseSwipe, type UseSwipeReturn } from '@vueuse/core'
import { Ref } from 'vue'

export interface UseSwipeOptions {
  passive?: boolean
  onSwipe?: (e: TouchEvent) => void
  onSwipeEnd?: (e: TouchEvent, direction: string) => void
  onSwipeStart?: (e: TouchEvent) => void
}

export function useSwipe(
  target: Ref<HTMLElement | undefined> | HTMLElement,
  options: UseSwipeOptions = {},
): UseSwipeReturn {
  return useVueUseSwipe(target, options)
}
