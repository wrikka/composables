import { useElementHover as useVueUseElementHover } from '@vueuse/core'
import { Ref } from 'vue'

export function useHover(target: Ref<HTMLElement | undefined> | HTMLElement) {
  return useVueUseElementHover(target)
}
