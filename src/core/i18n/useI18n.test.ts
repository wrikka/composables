import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useI18n } from './useI18n'

describe('useI18n', () => {
  it('should translate a simple key', () => {
    const locale = ref('en')
    const messages = ref({
      en: { greeting: 'Hello' },
      fr: { greeting: 'Bonjour' },
    })

    const { t } = useI18n({ locale, messages })

    expect(t('greeting')).toBe('Hello')
  })

  it('should translate a nested key', () => {
    const locale = ref('en')
    const messages = ref({
      en: { nav: { home: 'Home' } },
      fr: { nav: { home: 'Accueil' } },
    })

    const { t } = useI18n({ locale, messages })

    expect(t('nav.home')).toBe('Home')
  })

  it('should switch locale and translate correctly', async () => {
    const locale = ref('en')
    const messages = ref({
      en: { greeting: 'Hello' },
      fr: { greeting: 'Bonjour' },
    })

    const { t } = useI18n({ locale, messages })

    expect(t('greeting')).toBe('Hello')

    locale.value = 'fr'

    expect(t('greeting')).toBe('Bonjour')
  })

  it('should return undefined for a non-existent key', () => {
    const locale = ref('en')
    const messages = ref({
      en: { greeting: 'Hello' },
    })

    const { t } = useI18n({ locale, messages })

    expect(t('nonexistent.key')).toBeUndefined()
  })
})
