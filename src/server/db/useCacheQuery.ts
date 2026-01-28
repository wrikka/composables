import { ref, computed } from 'vue'

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  strategy?: 'lru' | 'fifo' | 'lfu' // Cache eviction strategy
}

export interface CacheStats {
  size: number
  maxSize: number
  hitRate: number
  hits: number
  misses: number
  evictions: number
}

export function useCacheQuery<T = any>(options: CacheOptions = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    maxSize = 100,
    strategy = 'lru'
  } = options

  const cache = ref<Map<string, CacheEntry<T>>>(new Map())
  const accessOrder = ref<string[]>([])
  const accessFrequency = ref<Map<string, number>>(new Map())
  
  const stats = ref({
    hits: 0,
    misses: 0,
    evictions: 0
  })

  const cacheSize = computed(() => cache.value.size)
  const hitRate = computed(() => {
    const total = stats.value.hits + stats.value.misses
    return total > 0 ? stats.value.hits / total : 0
  })

  const cacheStats = computed<CacheStats>(() => ({
    size: cacheSize.value,
    maxSize,
    hitRate: hitRate.value,
    hits: stats.value.hits,
    misses: stats.value.misses,
    evictions: stats.value.evictions
  }))

  const isExpired = (entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp > entry.ttl
  }

  const updateAccess = (key: string): void => {
    // Update access order for LRU
    if (strategy === 'lru') {
      const index = accessOrder.value.indexOf(key)
      if (index > -1) {
        accessOrder.value.splice(index, 1)
      }
      accessOrder.value.push(key)
    }

    // Update access frequency for LFU
    if (strategy === 'lfu') {
      const current = accessFrequency.value.get(key) || 0
      accessFrequency.value.set(key, current + 1)
    }
  }

  const evictEntry = (): string | null => {
    if (cache.value.size < maxSize) {
      return null
    }

    let keyToEvict: string | null = null

    switch (strategy) {
      case 'lru':
        keyToEvict = accessOrder.value[0] || null
        break
      
      case 'fifo':
        keyToEvict = cache.value.keys().next().value || null
        break
      
      case 'lfu':
        let minFrequency = Infinity
        for (const [key, frequency] of accessFrequency.value) {
          if (frequency < minFrequency) {
            minFrequency = frequency
            keyToEvict = key
          }
        }
        break
    }

    if (keyToEvict) {
      cache.value.delete(keyToEvict)
      accessOrder.value = accessOrder.value.filter(k => k !== keyToEvict)
      accessFrequency.value.delete(keyToEvict)
      stats.value.evictions++
    }

    return keyToEvict
  }

  const set = (key: string, data: T, customTtl?: number): void => {
    // Remove existing entry if it exists
    if (cache.value.has(key)) {
      cache.value.delete(key)
      accessOrder.value = accessOrder.value.filter(k => k !== key)
      accessFrequency.value.delete(key)
    }

    // Evict if necessary
    evictEntry()

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl,
      key
    }

    cache.value.set(key, entry)
    updateAccess(key)
  }

  const get = (key: string): T | null => {
    const entry = cache.value.get(key)

    if (!entry) {
      stats.value.misses++
      return null
    }

    if (isExpired(entry)) {
      cache.value.delete(key)
      accessOrder.value = accessOrder.value.filter(k => k !== key)
      accessFrequency.value.delete(key)
      stats.value.misses++
      return null
    }

    updateAccess(key)
    stats.value.hits++
    return entry.data
  }

  const has = (key: string): boolean => {
    const entry = cache.value.get(key)
    return entry !== undefined && !isExpired(entry)
  }

  const deleteEntry = (key: string): boolean => {
    const deleted = cache.value.delete(key)
    if (deleted) {
      accessOrder.value = accessOrder.value.filter(k => k !== key)
      accessFrequency.value.delete(key)
    }
    return deleted
  }

  const clear = (): void => {
    cache.value.clear()
    accessOrder.value = []
    accessFrequency.value.clear()
    stats.value = {
      hits: 0,
      misses: 0,
      evictions: 0
    }
  }

  const cleanup = (): number => {
    let cleaned = 0
    const keysToDelete: string[] = []

    for (const [key, entry] of cache.value) {
      if (isExpired(entry)) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      deleteEntry(key)
      cleaned++
    }

    return cleaned
  }

  const getKeys = (): string[] => {
    return Array.from(cache.value.keys())
  }

  const getValues = (): T[] => {
    return Array.from(cache.value.values()).map(entry => entry.data)
  }

  const getEntries = (): Array<[string, T]> => {
    return Array.from(cache.value.entries()).map(([key, entry]) => [key, entry.data])
  }

  const prefetch = async <K = any>(
    key: string,
    fetchFn: () => Promise<K>,
    customTtl?: number
  ): Promise<K | null> => {
    // Check if already cached
    const cached = get(key as string)
    if (cached !== null) {
      return cached as K
    }

    try {
      const data = await fetchFn()
      set(key as string, data as T, customTtl)
      return data
    } catch {
      return null
    }
  }

  const invalidate = (pattern: string | RegExp | ((key: string) => boolean)): number => {
    let invalidated = 0
    const keysToDelete: string[] = []

    for (const key of cache.value.keys()) {
      let shouldDelete = false

      if (typeof pattern === 'string') {
        shouldDelete = key.includes(pattern)
      } else if (pattern instanceof RegExp) {
        shouldDelete = pattern.test(key)
      } else if (typeof pattern === 'function') {
        shouldDelete = pattern(key)
      }

      if (shouldDelete) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      deleteEntry(key)
      invalidated++
    }

    return invalidated
  }

  return {
    // Cache operations
    get,
    set,
    has,
    delete: deleteEntry,
    clear,
    cleanup,
    prefetch,
    invalidate,
    
    // Cache info
    getKeys,
    getValues,
    getEntries,
    
    // Computed properties
    cacheSize,
    hitRate,
    cacheStats
  }
}
