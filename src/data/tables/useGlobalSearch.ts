import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export function useGlobalSearch<T extends Record<string, any>>(
  data: Ref<T[]>,
  keys: (keyof T)[]
) {
  const searchTerm = ref('')

  const searchResults: ComputedRef<T[]> = computed(() => {
    if (!searchTerm.value) {
      return data.value
    }

    const lowerCaseSearch = searchTerm.value.toLowerCase()

    return data.value.filter(item => {
      return keys.some(key => {
        const value = item[key]
        if (value === null || value === undefined) {
          return false
        }
        return String(value).toLowerCase().includes(lowerCaseSearch)
      })
    })
  })

  return {
    searchTerm,
    searchResults,
  }
}
