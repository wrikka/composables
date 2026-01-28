import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useCookie } from './useCookie'

describe('useCookie', () => {
  beforeEach(() => {
    document.cookie = ''
  })

  afterEach(() => {
    document.cookie = ''
  })

  it('should set and get cookie', () => {
    const { setCookie, getCookie } = useCookie()
    setCookie('test', 'value')

    expect(getCookie('test')).toBe('value')
  })

  it('should remove cookie', () => {
    const { setCookie, removeCookie, getCookie } = useCookie()
    setCookie('test', 'value')
    removeCookie('test')

    expect(getCookie('test')).toBeUndefined()
  })

  it('should clear all cookies', () => {
    const { setCookie, clearCookies, cookies } = useCookie()
    setCookie('test1', 'value1')
    setCookie('test2', 'value2')
    clearCookies()

    expect(Object.keys(cookies.value)).toHaveLength(0)
  })
})
