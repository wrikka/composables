import { ref, computed } from 'vue'

type CaseFormat = 'camel' | 'pascal' | 'kebab' | 'snake' | 'start'

export function useCaseConverter(initialValue: string = '', initialFormat: CaseFormat = 'camel') {
  const text = ref(initialValue)
  const fromFormat = ref<CaseFormat>(initialFormat)

  const toCamel = computed(() => convert(text.value, 'camel'))
  const toPascal = computed(() => convert(text.value, 'pascal'))
  const toKebab = computed(() => convert(text.value, 'kebab'))
  const toSnake = computed(() => convert(text.value, 'snake'))
  const toStart = computed(() => convert(text.value, 'start'))

  function convert(input: string, to: CaseFormat): string {
    const words = toWords(input)
    switch (to) {
      case 'camel':
        return words.map((word, i) => (i === 0 ? word.toLowerCase() : capitalize(word))).join('')
      case 'pascal':
        return words.map(capitalize).join('')
      case 'kebab':
        return words.map(word => word.toLowerCase()).join('-')
      case 'snake':
        return words.map(word => word.toLowerCase()).join('_')
      case 'start':
        return words.map(capitalize).join(' ')
      default:
        return input
    }
  }

  function toWords(input: string): string[] {
    return input
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to space
      .replace(/[_-]/g, ' ') // snake_case and kebab-case to space
      .split(/\s+/)
      .filter(Boolean)
  }

  function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }

  function set(newText: string, format?: CaseFormat) {
    text.value = newText
    if (format) {
      fromFormat.value = format
    }
  }

  return {
    text,
    fromFormat,
    toCamel,
    toPascal,
    toKebab,
    toSnake,
    toStart,
    convert,
    set,
  }
}
