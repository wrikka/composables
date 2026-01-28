import { useActiveElement as useVueUseActiveElement } from '@vueuse/core'

export { useActiveElement as useVueUseActiveElement }

export function useActiveElement() {
  return useVueUseActiveElement()
}
