import { useIntersectionObserver as useVueUseIntersectionObserver, type UseIntersectionObserverReturn } from '@vueuse/core'
import { ref, Ref } from 'vue'

export interface UseElementVisibilityOptions {
  threshold?: number | number[]
  root?: Element | Document | null
  rootMargin?: string
}

export function useElementVisibility(
  target: Ref<HTMLElement | undefined> | HTMLElement,
  options: UseElementVisibilityOptions = {},
): UseIntersectionObserverReturn {
  const isVisible = ref(false)
  const isIntersecting = ref(false)
  const intersectionRatio = ref(0)

  const { stop, start } = useVueUseIntersectionObserver(
    target,
    ([{ isIntersecting: intersecting, intersectionRatio: ratio }]) => {
      isVisible.value = intersecting
      isIntersecting.value = intersecting
      intersectionRatio.value = ratio
    },
    {
      threshold: options.threshold,
      root: options.root,
      rootMargin: options.rootMargin,
    },
  )

  return {
    isVisible,
    isIntersecting,
    intersectionRatio,
    stop,
    start,
  }
}
