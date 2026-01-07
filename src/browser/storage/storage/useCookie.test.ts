import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCookie } from './useCookie'

describe('useCookie', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true
    })
  })

  it('should initialize with null when cookie does not exist', () => {
    const { value } = useCookie('test-cookie')
    expect(value.value).toBe(null)
  })

  it('should parse existing cookie', () => {
    document.cookie = 'test-cookie=hello%20world'
    const { value } = useCookie('test-cookie')
    expect(value.value).toBe('hello world')
  })

  it('should parse JSON cookie', () => {
    document.cookie = 'test-cookie=%7B%22name%22%3A%22John%22%7D'
    const { value } = useCookie<{ name: string }>('test-cookie')
    expect(value.value).toEqual({ name: 'John' })
  })

  it('should set cookie value', () => {
    const { set, value } = useCookie('test-cookie')
    
    set('new value')
    
    expect(value.value).toBe('new value')
    expect(document.cookie).toContain('test-cookie=new%20value')
  })

  it('should set JSON cookie value', () => {
    const { set, value } = useCookie<any>('test-cookie')
    
    const obj = { name: 'John', age: 30 }
    set(obj)
    
    expect(value.value).toEqual(obj)
    expect(document.cookie).toContain('test-cookie=%7B%22name%22%3A%22John%22%2C%22age%22%3A30%7D')
  })

  it('should remove cookie', () => {
    document.cookie = 'test-cookie=value'
    const { remove, value } = useCookie('test-cookie')
    
    remove()
    
    expect(value.value).toBe(null)
    expect(document.cookie).toContain('test-cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT')
  })

  it('should check if cookie exists', () => {
    const { exists } = useCookie('test-cookie')
    
    expect(exists()).toBe(false)
    
    document.cookie = 'test-cookie=value'
    expect(exists()).toBe(true)
  })

  it('should handle cookie options', () => {
    const { set } = useCookie('test-cookie', {
      expires: new Date('2025-12-31'),
      domain: 'example.com',
      path: '/',
      secure: true,
      sameSite: 'strict'
    })
    
    set('value')
    
    expect(document.cookie).toContain('domain=example.com')
    expect(document.cookie).toContain('path=/')
    expect(document.cookie).toContain('secure')
    expect(document.cookie).toContain('samesite=strict')
  })
})
