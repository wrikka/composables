import { Ref } from 'vue'

interface Translations {
  [key: string]: string | Translations
}

interface I18nOptions {
  locale: Ref<string>
  messages: Ref<{ [key: string]: Translations }>
}

export function useI18n(options: I18nOptions) {
  const { locale, messages } = options

  const t = (key: string) => {
    return key.split('.').reduce((o: any, i) => {
      if (o) return o[i]
    }, messages.value[locale.value])
  }

  return { t, locale }
}
