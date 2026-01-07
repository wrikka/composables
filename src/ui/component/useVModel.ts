import { computed, getCurrentInstance } from 'vue'

export function useVModel(props: any, name: string) {
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error('useVModel must be called from within a component setup function')
  }

  const emit = instance.emit

  return computed({
    get() {
      return props[name]
    },
    set(value) {
      emit(`update:${name}`, value)
    },
  })
}
