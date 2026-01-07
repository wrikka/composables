import { ref, watch, type Ref } from 'vue'

export function useTitle(initialTitle: string | null = null): Ref<string | null> {
  const title = ref(initialTitle ?? (typeof document !== 'undefined' ? document.title : null))

  watch(
    title,
    (newTitle) => {
      if (typeof document !== 'undefined') {
        document.title = newTitle ?? ''
      }
    },
    { immediate: true }
  )

  return title
}
