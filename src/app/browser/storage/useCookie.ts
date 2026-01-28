import { ref, watch } from 'vue'

export interface CookieOptions {
  expires?: number | Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

export function useCookie() {
  const cookies = ref<Record<string, string>>({})

  const getCookies = () => {
    const documentCookies = document.cookie.split('; ')
    const cookieMap: Record<string, string> = {}

    for (const cookie of documentCookies) {
      const [name, value] = cookie.split('=')
      if (name && value) {
        cookieMap[name] = decodeURIComponent(value)
      }
    }

    return cookieMap
  }

  const getCookie = (name: string): string | undefined => {
    return cookies.value[name]
  }

  const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

    if (options.expires) {
      const expires = typeof options.expires === 'number'
        ? new Date(Date.now() + options.expires * 864e5)
        : options.expires
      cookieString += `; expires=${expires.toUTCString()}`
    }

    if (options.path) {
      cookieString += `; path=${options.path}`
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`
    }

    if (options.secure) {
      cookieString += '; secure'
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`
    }

    document.cookie = cookieString
    cookies.value = getCookies()
  }

  const removeCookie = (name: string, options: CookieOptions = {}) => {
    setCookie(name, '', { ...options, expires: -1 })
  }

  const clearCookies = () => {
    for (const name in cookies.value) {
      removeCookie(name)
    }
  }

  cookies.value = getCookies()

  watch(
    () => document.cookie,
    () => {
      cookies.value = getCookies()
    }
  )

  return {
    cookies,
    getCookie,
    setCookie,
    removeCookie,
    clearCookies,
  }
}
