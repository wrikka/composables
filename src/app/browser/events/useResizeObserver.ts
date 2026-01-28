import { useResizeObserver as useVueUseResizeObserver, type UseResizeObserverReturn } from '@vueuse/core'
import { Ref } from 'vue'

export interface UseResizeObserverOptions {
  window?: boolean
  deep?: boolean
}

export function useResizeObserver(
  target: Ref<HTMLElement | undefined> | HTMLElement | Window | Document,
  options: UseResizeObserverOptions = {},
): UseResizeObserverReturn {
  return useVueUseResizeObserver(target, options)
}
