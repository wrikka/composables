import { describe, it, expect, beforeEach } from 'vitest'
import { useTitle } from './useTitle'

describe('useTitle', () => {
  beforeEach(() => {
    document.title = 'Initial Title'
  })

  it('should set document title', () => {
    useTitle('New Title')
    expect(document.title).toBe('New Title')
  })

  it('should use initial document title if no argument is provided', () => {
    const title = useTitle()
    expect(title.value).toBe('Initial Title')
  })

  it('should update document title reactively', () => {
    const title = useTitle('My App')
    expect(document.title).toBe('My App')

    title.value = 'My Awesome App'
    expect(document.title).toBe('My Awesome App')
  })
})
