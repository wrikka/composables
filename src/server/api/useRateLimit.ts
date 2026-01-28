import { ref, computed } from 'vue'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (request: any) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
  message?: string
}

export interface RateLimitStats {
  totalRequests: number
  blockedRequests: number
  allowedRequests: number
  currentWindowRequests: number
  windowsProcessed: number
}

export function useRateLimit(config: RateLimitConfig) {
  const {
    windowMs = 60 * 1000, // 1 minute
    maxRequests = 100,
    keyGenerator = (request) => 'default',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later'
  } = config

  const requests = ref<Map<string, { count: number; resetTime: number }>>(new Map())
  const stats = ref<RateLimitStats>({
    totalRequests: 0,
    blockedRequests: 0,
    allowedRequests: 0,
    currentWindowRequests: 0,
    windowsProcessed: 0
  })

  const isBlocked = computed(() => {
    const now = Date.now()
    for (const [key, data] of requests.value) {
      if (data.count >= maxRequests && data.resetTime > now) {
        return true
      }
    }
    return false
  })

  const getStats = computed(() => stats.value)

  const cleanupExpiredWindows = (): void => {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, data] of requests.value) {
      if (data.resetTime <= now) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      requests.value.delete(key)
      stats.value.windowsProcessed++
    }
  }

  const checkLimit = (request: any): RateLimitResult => {
    cleanupExpiredWindows()

    const key = keyGenerator(request)
    const now = Date.now()
    
    let requestData = requests.value.get(key)

    if (!requestData || requestData.resetTime <= now) {
      requestData = {
        count: 0,
        resetTime: now + windowMs
      }
      requests.value.set(key, requestData)
    }

    stats.value.totalRequests++
    stats.value.currentWindowRequests = requestData.count

    const allowed = requestData.count < maxRequests
    const remaining = Math.max(0, maxRequests - requestData.count)

    if (allowed) {
      requestData.count++
      stats.value.allowedRequests++
    } else {
      stats.value.blockedRequests++
    }

    return {
      allowed,
      remaining,
      resetTime: requestData.resetTime,
      totalHits: requestData.count,
      message: allowed ? undefined : message
    }
  }

  const resetKey = (key: string): void => {
    requests.value.delete(key)
  }

  const resetAll = (): void => {
    requests.value.clear()
    stats.value = {
      totalRequests: 0,
      blockedRequests: 0,
      allowedRequests: 0,
      currentWindowRequests: 0,
      windowsProcessed: 0
    }
  }

  const getKeyInfo = (key: string): { count: number; resetTime: number; remaining: number } | null => {
    const data = requests.value.get(key)
    if (!data) return null

    const now = Date.now()
    if (data.resetTime <= now) {
      return null
    }

    return {
      count: data.count,
      resetTime: data.resetTime,
      remaining: Math.max(0, maxRequests - data.count)
    }
  }

  const getAllKeys = (): Array<{ key: string; count: number; resetTime: number; remaining: number }> => {
    const result: Array<{ key: string; count: number; resetTime: number; remaining: number }> = []
    const now = Date.now()

    for (const [key, data] of requests.value) {
      if (data.resetTime > now) {
        result.push({
          key,
          count: data.count,
          resetTime: data.resetTime,
          remaining: Math.max(0, maxRequests - data.count)
        })
      }
    }

    return result
  }

  return {
    checkLimit,
    resetKey,
    resetAll,
    getKeyInfo,
    getAllKeys,
    isBlocked,
    stats: getStats
  }
}

// Express.js middleware style rate limiter
export function useRateLimitMiddleware(config: RateLimitConfig) {
  const rateLimiter = useRateLimit(config)

  const middleware = (request: any, response: any, next: any) => {
    const result = rateLimiter.checkLimit(request)

    // Set rate limit headers
    response.setHeader('X-RateLimit-Limit', config.maxRequests)
    response.setHeader('X-RateLimit-Remaining', result.remaining)
    response.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000))

    if (!result.allowed) {
      response.status(429).json({
        error: 'Too Many Requests',
        message: result.message,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      })
      return
    }

    next()
  }

  return {
    middleware,
    ...rateLimiter
  }
}

// Advanced rate limiter with multiple tiers
export interface RateLimitTier {
  name: string
  windowMs: number
  maxRequests: number
  priority: number
}

export function useTieredRateLimit(tiers: RateLimitTier[]) {
  const tierLimiters = tiers.map(tier => ({
    ...tier,
    limiter: useRateLimit({
      windowMs: tier.windowMs,
      maxRequests: tier.maxRequests
    })
  }))

  const checkLimit = (request: any): RateLimitResult & { tier: string } => {
    // Sort tiers by priority (higher priority first)
    const sortedTiers = [...tierLimiters].sort((a, b) => b.priority - a.priority)

    for (const tier of sortedTiers) {
      const result = tier.limiter.checkLimit(request)
      
      if (!result.allowed) {
        return {
          ...result,
          tier: tier.name
        }
      }
    }

    return {
      allowed: true,
      remaining: Math.min(...sortedTiers.map(t => t.limiter.getKeyInfo('default')?.remaining || 0)),
      resetTime: Math.max(...sortedTiers.map(t => t.limiter.getKeyInfo('default')?.resetTime || 0)),
      totalHits: 0,
      tier: sortedTiers[0]?.name || 'default'
    }
  }

  const getTierStats = () => {
    return tierLimiters.map(tier => ({
      name: tier.name,
      stats: tier.limiter.stats.value
    }))
  }

  const resetTier = (tierName: string) => {
    const tier = tierLimiters.find(t => t.name === tierName)
    if (tier) {
      tier.limiter.resetAll()
    }
  }

  return {
    checkLimit,
    getTierStats,
    resetTier
  }
}
