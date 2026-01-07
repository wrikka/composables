import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export interface UseKeyboardReturn {
  isPressed: Ref<boolean>
  key: Ref<string | null>
  code: Ref<string | null>
  ctrl: Ref<boolean>
  shift: Ref<boolean>
  alt: Ref<boolean>
  meta: Ref<boolean>
}

export function useKeyboard(): UseKeyboardReturn {
  const isPressed = ref(false)
  const key = ref<string | null>(null)
  const code = ref<string | null>(null)
  const ctrl = ref(false)
  const shift = ref(false)
  const alt = ref(false)
  const meta = ref(false)

  const onKeyDown = (e: KeyboardEvent) => {
    isPressed.value = true
    key.value = e.key
    code.value = e.code
    ctrl.value = e.ctrlKey
    shift.value = e.shiftKey
    alt.value = e.altKey
    meta.value = e.metaKey
  }

  const onKeyUp = () => {
    isPressed.value = false
    key.value = null
    code.value = null
    ctrl.value = false
    shift.value = false
    alt.value = false
    meta.value = false
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  })

  return {
    isPressed,
    key,
    code,
    ctrl,
    shift,
    alt,
    meta,
  }
}