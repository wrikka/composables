import { useMouse as useVueUseMouse, type UseMouseReturn } from '@vueuse/core'

export interface UseMouseOptions {
  type?: 'page' | 'client' | 'movement'
  touch?: boolean
  resetOnTouchEnds?: boolean
  initialValue?: { x: number; y: number }
}

export function useMouse(options: UseMouseOptions = {}): UseMouseReturn {
  return useVueUseMouse(options)
}
