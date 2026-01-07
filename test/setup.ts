import { vi } from 'vitest'

// Mock window methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi
  .fn()
  .mockImplementation(function (this: any, _callback: ResizeObserverCallback) {
    this.observe = vi.fn()
    this.unobserve = vi.fn()
    this.disconnect = vi.fn()
  })

Object.defineProperty(window, 'ResizeObserver', {
  value: global.ResizeObserver,
  writable: true,
})

// Mock IntersectionObserver
global.IntersectionObserver = vi
  .fn()
  .mockImplementation(function (
    this: any,
    _callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit
  ) {
    this.observe = vi.fn()
    this.unobserve = vi.fn()
    this.disconnect = vi.fn()
  })

Object.defineProperty(window, 'IntersectionObserver', {
  value: global.IntersectionObserver,
  writable: true,
})

// Mock navigator
Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true,
})

class MemoryStorage implements Storage {
  #store = new Map<string, string>()

  get length() {
    return this.#store.size
  }

  clear() {
    this.#store.clear()
  }

  getItem(key: string) {
    return this.#store.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.#store.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.#store.delete(key)
  }

  setItem(key: string, value: string) {
    this.#store.set(key, value)
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new MemoryStorage(),
  writable: true,
})

Object.defineProperty(window, 'sessionStorage', {
  value: new MemoryStorage(),
  writable: true,
})

Object.defineProperty(globalThis, 'indexedDB', {
  value: {
    open: vi.fn(),
    deleteDatabase: vi.fn(),
  },
  writable: true,
})
