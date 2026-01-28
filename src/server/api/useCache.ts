import { ref, computed } from 'vue'

export interface CacheConfig {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of cached responses
  strategy?: 'lru' | 'fifo' | 'lfu' // Cache eviction strategy
  keyGenerator?: (request: any) => string
  shouldCache?: (request: any, response: any) => boolean
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  size: number
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  maxSize: number
  hitRate: number
  evictions: number
  memoryUsage: number
}

export function useCache<T = any>(config: CacheConfig = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    maxSize = 1000,
    strategy = 'lru',
    keyGenerator = (request) => JSON.stringify(request),
    shouldCache = () => true
  } = config

  const cache = ref<Map<string, CacheEntry<T>>>(new Map())
  const accessOrder = ref<string[]>([])
  const accessFrequency = ref<Map<string, number>>(new Map())
  
  const stats = ref<CacheStats>({
    hits: 0,
    misses: 0,
    size: 0,
    maxSize,
    hitRate: 0,
    evictions: 0,
    memoryUsage: 0
  })

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

  const calculateMemoryUsage = (): number => {
    let totalSize = 0
    for (const [key, entry] of cache.value) {
      totalSize += key.length * 2 // Rough estimate for string size
      totalSize += entry.size
    }
    return totalSize
  }

  const updateStats = (): void => {
    const total = stats.value.hits + stats.value.misses
    stats.value.hitRate = total > 0 ? stats.value.hits / total : 0
    stats.value.size = cache.value.size
    stats.value.memoryUsage = calculateMemoryUsage()
  }

  const get = (request: any): T | null => {
    const key = keyGenerator(request)
    const entry = cache.value.get(key)

    if (!entry) {
      stats.value.misses++
      updateStats()
      return null
    }

    if (isExpired(entry)) {
      cache.value.delete(key)
      accessOrder.value = accessOrder.value.filter(k => k !== key)
      accessFrequency.value.delete(key)
      stats.value.misses++
      updateStats()
      return null
    }

    entry.hits++
    updateAccess(key)
    stats.value.hits++
    updateStats()
    
    return entry.data
  }

  const set = (request: any, response: T, customTtl?: number): void => {
    if (!shouldCache(request, response)) {
      return
    }

    const key = keyGenerator(request)
    
    // Remove existing entry if it exists
    if (cache.value.has(key)) {
      cache.value.delete(key)
      accessOrder.value = accessOrder.value.filter(k => k !== key)
      accessFrequency.value.delete(key)
    }

    // Evict if necessary
    evictEntry()

    const entry: CacheEntry<T> = {
      data: response,
      timestamp: Date.now(),
      ttl: customTtl || ttl,
      hits: 0,
      size: JSON.stringify(response).length * 2 // Rough estimate
    }

    cache.value.set(key, entry)
    updateAccess(key)
    updateStats()
  }

  const has = (request: any): boolean => {
    const key = keyGenerator(request)
    const entry = cache.value.get(key)
    return entry !== undefined && !isExpired(entry)
  }

  const deleteEntry = (request: any): boolean => {
    const key = keyGenerator(request)
    const deleted = cache.value.delete(key)
    if (deleted) {
      accessOrder.value = accessOrder.value.filter(k => k !== key)
      accessFrequency.value.delete(key)
      updateStats()
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
      size: 0,
      maxSize,
      hitRate: 0,
      evictions: 0,
      memoryUsage: 0
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
      deleteEntry({ key })
      cleaned++
    }

    return cleaned
  }

  const getKeys = (): string[] => {
    return Array.from(cache.value.keys())
  }

  const getEntries = (): Array<[string, T]> => {
    return Array.from(cache.value.entries()).map(([key, entry]) => [key, entry.data])
  }

  const getEntryInfo = (request: any): CacheEntry<T> | null => {
    const key = keyGenerator(request)
    return cache.value.get(key) || null
  }

  return {
    get,
    set,
    has,
    delete: deleteEntry,
    clear,
    cleanup,
    getKeys,
    getEntries,
    getEntryInfo,
    stats: computed(() => stats.value)
  }
}

// Response caching middleware
export function useResponseCache(config: CacheConfig = {}) {
  const cache = useCache(config)

  const middleware = (request: any, response: any, next: any) => {
    // Check if we have a cached response
    const cached = cache.get(request)
    
    if (cached) {
      // Set cache headers
      response.setHeader('X-Cache', 'HIT')
      response.setHeader('X-Cache-Age', Math.floor((Date.now() - cached.timestamp) / 1000))
      
      // Send cached response
      return response.json(cached)
    }

    // Set cache miss header
    response.setHeader('X-Cache', 'MISS')

    // Intercept the response to cache it
    const originalJson = response.json
    response.json = (data: any) => {
      // Cache the response
      cache.set(request, data)
      
      // Send the response
      return originalJson.call(response, data)
    }

    next()
  }

  return {
    middleware,
    ...cache
  }
}

// HTTP cache with ETag support
export interface HttpCacheEntry<T = any> extends CacheEntry<T> {
  etag?: string
  lastModified?: string
}

export function useHttpCache(config: CacheConfig = {}) {
  const cache = useCache<HttpCacheEntry>(config)

  const generateETag = (data: any): string => {
    const hash = require('crypto')
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex')
    return `"${hash}"`
  }

  const get = (request: any): HttpCacheEntry<T> | null => {
    const entry = cache.get(request) as HttpCacheEntry<T> | null
    
    if (entry) {
      // Check If-None-Match header
      const ifNoneMatch = request.headers?.['if-none-match']
      if (ifNoneMatch && entry.etag === ifNoneMatch) {
        return null // Signal 304 Not Modified
      }

      // Check If-Modified-Since header
      const ifModifiedSince = request.headers?.['if-modified-since']
      if (ifModifiedSince && entry.lastModified) {
        const requestTime = new Date(ifModifiedSince).getTime()
        const responseTime = new Date(entry.lastModified).getTime()
        if (responseTime <= requestTime) {
          return null // Signal 304 Not Modified
        }
      }
    }

    return entry
  }

  const set = (request: any, response: T): void => {
    const entry: HttpCacheEntry<T> = {
      data: response,
      timestamp: Date.now(),
      ttl: config.ttl || 5 * 60 * 1000,
      hits: 0,
      size: JSON.stringify(response).length * 2,
      etag: generateETag(response),
      lastModified: new Date().toISOString()
    }

    cache.set(request, entry)
  }

  const middleware = (request: any, response: any, next: any) => {
    const cached = get(request)
    
    if (cached) {
      // Set cache headers
      response.setHeader('X-Cache', 'HIT')
      response.setHeader('X-Cache-Age', Math.floor((Date.now() - cached.timestamp) / 1000))
      
      if (cached.etag) {
        response.setHeader('ETag', cached.etag)
      }
      
      if (cached.lastModified) {
        response.setHeader('Last-Modified', cached.lastModified)
      }
      
      return response.json(cached.data)
    }

    // Check for 304 condition
    if (cached === null) {
      return response.status(304).end()
    }

    // Set cache miss header
    response.setHeader('X-Cache', 'MISS')

    // Intercept the response to cache it
    const originalJson = response.json
    response.json = (data: any) => {
      set(request, data)
      return originalJson.call(response, data)
    }

    next()
  }

  return {
    middleware,
    get,
    set,
    ...cache
  }
}
