import { ref, onMounted, onUnmounted } from 'vue'

export interface HotkeyOptions {
  preventDefault?: boolean
  stopPropagation?: boolean
  enabled?: boolean
}

export interface HotkeyBinding {
  key: string
  handler: (event: KeyboardEvent) => void
  options?: HotkeyOptions
}

export function useHotkey() {
  const bindings = ref<Map<string, HotkeyBinding[]>>(new Map())
  const isEnabled = ref(true)

  const normalizeKey = (event: KeyboardEvent): string => {
    const parts: string[] = []
    
    if (event.ctrlKey) parts.push('ctrl')
    if (event.altKey) parts.push('alt')
    if (event.shiftKey) parts.push('shift')
    if (event.metaKey) parts.push('meta')
    
    // Handle special keys
    let key = event.key.toLowerCase()
    if (key === ' ') key = 'space'
    if (key === 'escape') key = 'esc'
    
    parts.push(key)
    return parts.join('+')
  }

  const addHotkey = (key: string, handler: (event: KeyboardEvent) => void, options: HotkeyOptions = {}) => {
    const normalizedKey = key.toLowerCase()
    
    if (!bindings.value.has(normalizedKey)) {
      bindings.value.set(normalizedKey, [])
    }
    
    bindings.value.get(normalizedKey)!.push({
      key: normalizedKey,
      handler,
      options: {
        preventDefault: true,
        stopPropagation: false,
        enabled: true,
        ...options
      }
    })
  }

  const removeHotkey = (key: string, handler?: (event: KeyboardEvent) => void) => {
    const normalizedKey = key.toLowerCase()
    const bindingList = bindings.value.get(normalizedKey)
    
    if (bindingList) {
      if (handler) {
        // Remove specific handler
        const index = bindingList.findIndex(binding => binding.handler === handler)
        if (index > -1) {
          bindingList.splice(index, 1)
        }
      } else {
        // Remove all handlers for this key
        bindingList.length = 0
      }
      
      if (bindingList.length === 0) {
        bindings.value.delete(normalizedKey)
      }
    }
  }

  const clearHotkeys = () => {
    bindings.value.clear()
  }

  const enable = () => {
    isEnabled.value = true
  }

  const disable = () => {
    isEnabled.value = false
  }

  const toggle = () => {
    isEnabled.value = !isEnabled.value
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isEnabled.value) return

    const normalizedKey = normalizeKey(event)
    const bindingList = bindings.value.get(normalizedKey)
    
    if (bindingList) {
      for (const binding of bindingList) {
        if (binding.options?.enabled !== false) {
          if (binding.options?.preventDefault) {
            event.preventDefault()
          }
          if (binding.options?.stopPropagation) {
            event.stopPropagation()
          }
          
          binding.handler(event)
        }
      }
    }
  }

  const hasHotkey = (key: string): boolean => {
    return bindings.value.has(key.toLowerCase())
  }

  const getHotkeys = (): string[] => {
    return Array.from(bindings.value.keys())
  }

  const isHotkeyPressed = (key: string, event?: KeyboardEvent): boolean => {
    if (!event) return false
    
    const normalizedKey = key.toLowerCase()
    const parts = normalizedKey.split('+')
    
    return parts.every(part => {
      switch (part) {
        case 'ctrl':
        case 'control':
          return event.ctrlKey
        case 'alt':
          return event.altKey
        case 'shift':
          return event.shiftKey
        case 'meta':
        case 'cmd':
        case 'command':
          return event.metaKey
        default:
          return event.key.toLowerCase() === part
      }
    })
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    bindings,
    isEnabled,
    addHotkey,
    removeHotkey,
    clearHotkeys,
    enable,
    disable,
    toggle,
    hasHotkey,
    getHotkeys,
    isHotkeyPressed
  }
}
