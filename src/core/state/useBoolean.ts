import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface UseBooleanOptions {
  defaultValue?: boolean
  onChange?: (value: boolean) => void
}

export interface UseBooleanReturn {
  value: Ref<boolean>
  setTrue: () => void
  setFalse: () => void
  toggle: () => void
  set: (value: boolean) => void
  isTrue: ComputedRef<boolean>
  isFalse: ComputedRef<boolean>
}

export function useBoolean(defaultValue = false, options: UseBooleanOptions = {}) {
  const { onChange } = options
  
  const value = ref(defaultValue)

  const setTrue = () => {
    value.value = true
    onChange?.(true)
  }

  const setFalse = () => {
    value.value = false
    onChange?.(false)
  }

  const toggle = () => {
    value.value = !value.value
    onChange?.(value.value)
  }

  const set = (newValue: boolean) => {
    value.value = newValue
    onChange?.(newValue)
  }

  const isTrue = computed(() => value.value === true)
  const isFalse = computed(() => value.value === false)

  return {
    value,
    setTrue,
    setFalse,
    toggle,
    set,
    isTrue,
    isFalse
  }
}
