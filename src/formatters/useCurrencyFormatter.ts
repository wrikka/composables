import { computed, Ref } from 'vue'

interface CurrencyFormatterOptions extends Intl.NumberFormatOptions {
  locale?: string
}

export function useCurrencyFormatter(number: Ref<number>, options: Ref<CurrencyFormatterOptions>) {
  const formatter = computed(() => {
    return new Intl.NumberFormat(options.value.locale, {
      style: 'currency',
      ...options.value,
    })
  })

  const formatted = computed(() => formatter.value.format(number.value))

  return { formatted }
}
