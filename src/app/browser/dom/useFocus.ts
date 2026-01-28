import { useActiveElement as useVueUseActiveElement, useFocus as useVueUseFocus, type UseFocusReturn } from '@vueuse/core'
import type { Ref } from 'vue'

export interface UseFocusOptions {
  initialValue?: boolean
}

export function useFocus(target: Ref<HTMLElement | undefined> | HTMLElement, options: UseFocusOptions = {}): UseFocusReturn {
  return useVueUseFocus(target, {
    initialValue: options.initialValue,
  })
}

export function useActiveElement() {
  return useVueUseActiveElement()
}
