import { ref, onMounted, onUnmounted } from 'vue'

export interface UseKeyboardOptions {
  target?: EventTarget
  passive?: boolean
}

export function useKeyboard(options: UseKeyboardOptions = {}) {
  const { target = window, passive = true } = options
  
  const pressed = ref<Set<string>>(new Set())
  const lastKey = ref<string | null>(null)
  const ctrlPressed = ref(false)
  const shiftPressed = ref(false)
  const altPressed = ref(false)
  const metaPressed = ref(false)

  const handleKeyDown = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent
    pressed.value.add(keyboardEvent.key)
    lastKey.value = keyboardEvent.key
    
    ctrlPressed.value = keyboardEvent.ctrlKey
    shiftPressed.value = keyboardEvent.shiftKey
    altPressed.value = keyboardEvent.altKey
    metaPressed.value = keyboardEvent.metaKey
  }

  const handleKeyUp = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent
    pressed.value.delete(keyboardEvent.key)
    
    ctrlPressed.value = keyboardEvent.ctrlKey
    shiftPressed.value = keyboardEvent.shiftKey
    altPressed.value = keyboardEvent.altKey
    metaPressed.value = keyboardEvent.metaKey
  }

  const isPressed = (key: string) => pressed.value.has(key)

  const isHotkey = (hotkey: string) => {
    const keys = hotkey.toLowerCase().split('+').map(k => k.trim())
    
    return keys.every(key => {
      switch (key) {
        case 'ctrl':
        case 'control':
          return ctrlPressed.value
        case 'shift':
          return shiftPressed.value
        case 'alt':
          return altPressed.value
        case 'meta':
        case 'cmd':
        case 'command':
          return metaPressed.value
        default:
          return isPressed(key.toLowerCase())
      }
    })
  }

  onMounted(() => {
    target.addEventListener('keydown', handleKeyDown, { passive })
    target.addEventListener('keyup', handleKeyUp, { passive })
  })

  onUnmounted(() => {
    target.removeEventListener('keydown', handleKeyDown)
    target.removeEventListener('keyup', handleKeyUp)
  })

  return {
    pressed,
    lastKey,
    ctrlPressed,
    shiftPressed,
    altPressed,
    metaPressed,
    isPressed,
    isHotkey
  }
}
