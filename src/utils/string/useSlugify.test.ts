import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useSlugify } from './useSlugify'

describe('useSlugify', () => {
  it('should convert a simple string to a slug', () => {
    const text = ref('Hello World')
    const { slug } = useSlugify(text)
    expect(slug.value).toBe('hello-world')
  })

  it('should remove special characters', () => {
    const text = ref('Hello!@#$%^&*()_+ World?')
    const { slug } = useSlugify(text)
    expect(slug.value).toBe('helloworld')
  })

  it('should replace multiple spaces and hyphens with a single hyphen', () => {
    const text = ref('Hello   ---   World')
    const { slug } = useSlugify(text)
    expect(slug.value).toBe('hello-world')
  })

  it('should trim leading and trailing hyphens', () => {
    const text = ref('---Hello World---')
    const { slug } = useSlugify(text)
    expect(slug.value).toBe('hello-world')
  })

  it('should handle an empty string', () => {
    const text = ref('')
    const { slug } = useSlugify(text)
    expect(slug.value).toBe('')
  })

  it('should be reactive to changes in the source ref', async () => {
    const text = ref('Initial Text')
    const { slug } = useSlugify(text)
    expect(slug.value).toBe('initial-text')

    text.value = 'Updated Text!'
    expect(slug.value).toBe('updated-text')
  })
})
