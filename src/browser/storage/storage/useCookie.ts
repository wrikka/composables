import { ref, watch, type Ref } from 'vue'

export interface UseCookieOptions {
  expires?: Date | number
  maxAge?: number
  domain?: string
  path?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  httpOnly?: boolean
}

export function useCookie<T = string>(name: string, options: UseCookieOptions = {}): {
  value: Ref<T | null>
  set: (newValue: T, newOptions?: UseCookieOptions) => void
  remove: () => void
  parse: () => T | null
  exists: () => boolean
} {
  const value = ref<T | null>(null)

  const parseCookie = (): T | null => {
    if (typeof document === 'undefined') return null

    const cookies = document.cookie.split(';')
    const targetCookie = cookies.find(cookie => {
      const [cookieName] = cookie.trim().split('=')
      return cookieName === name
    })

    if (!targetCookie) return null

    const [, cookieValue] = targetCookie.split('=')
    try {
      return JSON.parse(decodeURIComponent(cookieValue || '')) as T
    } catch {
      return decodeURIComponent(cookieValue || '') as T
    }
  }

  const serializeCookie = (value: T): string => {
    const serializedValue = typeof value === 'string' 
      ? value 
      : JSON.stringify(value)
    
    let cookie = `${name}=${encodeURIComponent(serializedValue)}`

    if (options.expires) {
      const expires = options.expires instanceof Date 
        ? options.expires.toUTCString()
        : new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000).toUTCString()
      cookie += `; expires=${expires}`
    }

    if (options.maxAge) {
      cookie += `; max-age=${options.maxAge}`
    }

    if (options.domain) {
      cookie += `; domain=${options.domain}`
    }

    if (options.path) {
      cookie += `; path=${options.path}`
    }

    if (options.secure) {
      cookie += '; secure'
    }

    if (options.sameSite) {
      cookie += `; samesite=${options.sameSite}`
    }

    if (options.httpOnly) {
      cookie += '; httponly'
    }

    return cookie
  }

  const set = (newValue: T, _newOptions?: UseCookieOptions) => {
    if (typeof document === 'undefined') return

    const cookie = serializeCookie(newValue)
    document.cookie = cookie
    value.value = newValue
  }

  const remove = () => {
    if (typeof document === 'undefined') return

    const cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    document.cookie = cookie
    value.value = null
  }

  const exists = (): boolean => {
    return parseCookie() !== null
  }

  // Initialize value
  value.value = parseCookie()

  // Watch for value changes
  watch(value, (newValue) => {
    if (newValue !== null) {
      set(newValue)
    }
  })

  return {
    value: value as Ref<T | null>,
    set,
    remove,
    parse: () => value.value,
    exists
  }
}
