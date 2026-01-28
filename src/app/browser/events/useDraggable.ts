import { useDraggable as useVueUseDraggable, type UseDraggableReturn } from '@vueuse/core'
import { Ref } from 'vue'

export interface UseDraggableOptions {
  exact?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
  disabled?: boolean
  handle?: string
}

export function useDraggable(
  target: Ref<HTMLElement | undefined> | HTMLElement,
  options: UseDraggableOptions = {},
): UseDraggableReturn {
  return useVueUseDraggable(target, options)
}
