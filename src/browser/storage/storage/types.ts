import type { Ref } from 'vue'

export interface UseStorageReturn<T> {
  value: Ref<T>
  remove: () => void
  clear: () => void
}
