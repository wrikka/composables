import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface UseToggleOptions {
  defaultValue?: boolean
  onToggle?: (value: boolean) => void
}

export interface UseToggleReturn {
  value: Ref<boolean>
  on: () => void
  off: () => void
  toggle: () => void
  set: (value: boolean) => void
  isTrue: ComputedRef<boolean>
  isFalse: ComputedRef<boolean>
}

export function useToggle(defaultValue = false, options: UseToggleOptions = {}) {
  const { onToggle } = options
  
  const value = ref(defaultValue)

  const on = () => {
    value.value = true
    onToggle?.(true)
  }

  const off = () => {
    value.value = false
    onToggle?.(false)
  }

  const toggle = () => {
    value.value = !value.value
    onToggle?.(value.value)
  }

  const set = (newValue: boolean) => {
    value.value = newValue
    onToggle?.(newValue)
  }

  const isTrue = computed(() => value.value === true)
  const isFalse = computed(() => value.value === false)

  return {
    value,
    on,
    off,
    toggle,
    set,
    isTrue,
    isFalse
  }
}
