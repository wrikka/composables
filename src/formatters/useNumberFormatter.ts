import { computed, Ref } from 'vue'

interface NumberFormatterOptions extends Intl.NumberFormatOptions {
  locale?: string
}

export function useNumberFormatter(number: Ref<number>, options: Ref<NumberFormatterOptions>) {
  const formatter = computed(() => {
    return new Intl.NumberFormat(options.value.locale, options.value)
  })

  const formatted = computed(() => formatter.value.format(number.value))

  return { formatted }
}
