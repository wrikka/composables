import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useTruncate } from './useTruncate'

describe('useTruncate', () => {
  it('should not truncate text if it is shorter than or equal to the specified length', () => {
    const text = ref('Hello')
    const { truncatedText } = useTruncate(text, { length: 10 })
    expect(truncatedText.value).toBe('Hello')

    text.value = 'Exactly 10'
    const { truncatedText: truncatedText2 } = useTruncate(text, { length: 10 })
    expect(truncatedText2.value).toBe('Exactly 10')
  })

  it('should truncate text if it is longer than the specified length', () => {
    const text = ref('This is a long text')
    const { truncatedText } = useTruncate(text, { length: 10 })
    expect(truncatedText.value).toBe('This is a ...')
  })

  it('should use the default ellipsis (...)', () => {
    const text = ref('This is a long text')
    const { truncatedText } = useTruncate(text, { length: 10 })
    expect(truncatedText.value).toBe('This is a ...')
  })

  it('should use a custom ellipsis', () => {
    const text = ref('This is a long text')
    const { truncatedText } = useTruncate(text, { length: 10, ellipsis: '---' })
    expect(truncatedText.value).toBe('This is a ---')
  })

  it('should handle an empty string', () => {
    const text = ref('')
    const { truncatedText } = useTruncate(text, { length: 10 })
    expect(truncatedText.value).toBe('')
  })

  it('should be reactive to changes in the source ref', async () => {
    const text = ref('Initial')
    const { truncatedText } = useTruncate(text, { length: 5 })
    expect(truncatedText.value).toBe('Initial')

    text.value = 'This is a much longer text now'
    expect(truncatedText.value).toBe('This ...')
  })
})
