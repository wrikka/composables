import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export interface UseInfiniteScrollOptions {
  target: Ref<HTMLElement | null>
  distance?: number
  onLoad: () => Promise<void>
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const { target, distance = 100, onLoad } = options

  const isLoading = ref(false)
  const hasMore = ref(true)

  const loadMore = async () => {
    if (isLoading.value || !hasMore.value) return

    isLoading.value = true
    try {
      await onLoad()
    } finally {
      isLoading.value = false
    }
  }

  const handleScroll = () => {
    const el = target.value
    if (!el) return

    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollHeight - scrollTop <= clientHeight + distance) {
      loadMore()
    }
  }

  onMounted(() => {
    const el = target.value
    if (el) {
      el.addEventListener('scroll', handleScroll)
    }
  })

  onUnmounted(() => {
    const el = target.value
    if (el) {
      el.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    isLoading,
    hasMore,
    loadMore,
  }
}
