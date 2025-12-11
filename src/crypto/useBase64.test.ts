import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useBase64 } from './useBase64'

describe('useBase64', () => {
  it('should encode and decode a string', () => {
    const text = ref('Hello, World!')
    const { encoded, decoded } = useBase64(text)

    // btoa('Hello, World!') = 'SGVsbG8sIFdvcmxkIQ=='
    expect(encoded.value).toBe('SGVsbG8sIFdvcmxkIQ==')
    expect(decoded.value).toBe('Hello, World!')
  })

  it('should react to changes in the source ref', async () => {
    const text = ref('Initial')
    const { encoded, decoded } = useBase64(text)

    expect(encoded.value).toBe('SW5pdGlhbA==')
    expect(decoded.value).toBe('Initial')

    text.value = 'Updated'
    await new Promise(resolve => setTimeout(resolve, 0)) // wait for next tick

    expect(encoded.value).toBe('VXBkYXRlZA==')
    expect(decoded.value).toBe('Updated')
  })
})
