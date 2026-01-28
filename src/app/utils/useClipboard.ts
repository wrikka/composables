import { ref } from 'vue'

export interface ClipboardState {
  text: string | null
  copy: (text: string) => Promise<void>
  paste: () => Promise<string | null>
  clear: () => Promise<void>
}

export function useClipboard() {
  const text = ref<string | null>(null)

  const copy = async (content: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content)
      text.value = content
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const paste = async (): Promise<string | null> => {
    try {
      const content = await navigator.clipboard.readText()
      text.value = content
      return content
    } catch (err) {
      console.error('Failed to paste:', err)
      return null
    }
  }

  const clear = async (): Promise<void> => {
    text.value = null
  }

  return {
    text,
    copy,
    paste,
    clear,
  }
}
