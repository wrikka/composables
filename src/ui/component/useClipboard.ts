import { ref, readonly } from 'vue'

export function useClipboard() {
  const isSupported = Boolean(navigator && 'clipboard' in navigator)
  const text = ref('')
  const copied = ref(false)

  const copy = async (value: string) => {
    if (isSupported) {
      await navigator.clipboard.writeText(value)
      text.value = value
      copied.value = true

      setTimeout(() => {
        copied.value = false
      }, 1500)
    }
  }

  return {
    isSupported,
    text: readonly(text),
    copied: readonly(copied),
    copy,
  }
}
