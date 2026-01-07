import { ref, computed } from 'vue'

export interface UseSearchOptions<T> {
  keys?: (keyof T)[]
  caseSensitive?: boolean
  fuzzy?: boolean
  threshold?: number
}

export function useSearch<T>(items: T[], options: UseSearchOptions<T> = {}) {
  const { 
    keys = [], 
    caseSensitive = false, 
    fuzzy = false, 
    threshold = 0.6 
  } = options

  const query = ref('')
  const searchKeys = ref(keys)

  const normalizeString = (str: string): string => {
    return caseSensitive ? str : str.toLowerCase()
  }

  const fuzzyMatch = (text: string, pattern: string, threshold: number): boolean => {
    const textNorm = normalizeString(text)
    const patternNorm = normalizeString(pattern)
    
    if (textNorm.includes(patternNorm)) return true
    
    // Simple fuzzy matching
    let patternIndex = 0
    let score = 0
    
    for (let i = 0; i < textNorm.length && patternIndex < patternNorm.length; i++) {
      if (textNorm[i] === patternNorm[patternIndex]) {
        score++
        patternIndex++
      }
    }
    
    const matchScore = score / patternNorm.length
    return matchScore >= threshold
  }

  const exactMatch = (text: string, pattern: string): boolean => {
    return normalizeString(text).includes(normalizeString(pattern))
  }

  const searchInItem = (item: T, searchQuery: string): boolean => {
    if (!searchQuery.trim()) return true

    const keysToSearch = searchKeys.value.length > 0 ? searchKeys.value : (Object.keys(item as any) as (keyof T)[])

    return keysToSearch.some(key => {
      const value = item[key as keyof T]
      if (value == null) return false

      const stringValue = String(value)
      return fuzzy 
        ? fuzzyMatch(stringValue, searchQuery, threshold)
        : exactMatch(stringValue, searchQuery)
    })
  }

  const filteredItems = computed(() => {
    if (!query.value.trim()) return items

    return items.filter(item => searchInItem(item, query.value))
  })

  const search = (searchQuery: string) => {
    query.value = searchQuery
  }

  const clear = () => {
    query.value = ''
  }

  const setKeys = (keys: (keyof T)[]) => {
    searchKeys.value = keys
  }

  const addKey = (key: keyof T) => {
    if (!searchKeys.value.includes(key as any)) {
      searchKeys.value.push(key as any)
    }
  }

  const removeKey = (key: keyof T) => {
    searchKeys.value = searchKeys.value.filter(k => k !== key)
  }

  const hasResults = computed(() => filteredItems.value.length > 0)
  const resultCount = computed(() => filteredItems.value.length)
  const isEmpty = computed(() => !query.value.trim())

  return {
    query,
    searchKeys,
    filteredItems,
    hasResults,
    resultCount,
    isEmpty,
    search,
    clear,
    setKeys,
    addKey,
    removeKey
  }
}

// Advanced search with multiple filters
export interface SearchFilter<T> {
  key: keyof T
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte'
  value: any
}

export function useAdvancedSearch<T>(items: T[]) {
  const query = ref('')
  const filters = ref<SearchFilter<T>[]>([])

  const applyFilter = (item: T, filter: SearchFilter<T>): boolean => {
    const { key, operator, value } = filter
    const itemValue = item[key]

    switch (operator) {
      case 'equals':
        return itemValue === value
      case 'contains':
        return String(itemValue).toLowerCase().includes(String(value).toLowerCase())
      case 'startsWith':
        return String(itemValue).toLowerCase().startsWith(String(value).toLowerCase())
      case 'endsWith':
        return String(itemValue).toLowerCase().endsWith(String(value).toLowerCase())
      case 'gt':
        return Number(itemValue) > Number(value)
      case 'gte':
        return Number(itemValue) >= Number(value)
      case 'lt':
        return Number(itemValue) < Number(value)
      case 'lte':
        return Number(itemValue) <= Number(value)
      default:
        return true
    }
  }

  const filteredItems = computed(() => {
    let result = items

    // Apply text search
    if (query.value.trim()) {
      result = result.filter(item => {
        return Object.values(item as any).some(value => 
          String(value).toLowerCase().includes(query.value.toLowerCase())
        )
      })
    }

    // Apply filters
    return result.filter(item => 
      filters.value.every(filter => applyFilter(item, filter as SearchFilter<T>))
    )
  })

  const addFilter = (filter: SearchFilter<T>) => {
    const existingIndex = filters.value.findIndex(f => f.key === filter.key)
    if (existingIndex >= 0) {
      filters.value[existingIndex] = filter as any
    } else {
      filters.value.push(filter as any)
    }
  }

  const removeFilter = (key: keyof T) => {
    filters.value = filters.value.filter(f => f.key !== key)
  }

  const clearFilters = () => {
    filters.value = []
  }

  const search = (searchQuery: string) => {
    query.value = searchQuery
  }

  const clear = () => {
    query.value = ''
    filters.value = []
  }

  return {
    query,
    filters,
    filteredItems,
    addFilter,
    removeFilter,
    clearFilters,
    search,
    clear
  }
}
