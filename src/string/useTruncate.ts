import { computed, Ref } from 'vue'

interface TruncateOptions {
  length: number
  ellipsis?: string
}

export function useTruncate(text: Ref<string>, options: TruncateOptions) {
  const { length, ellipsis = '...' } = options

  const truncatedText = computed(() => {
    if (text.value.length <= length) {
      return text.value
    }
    return text.value.substring(0, length) + ellipsis
  })

  return { truncatedText }
}
