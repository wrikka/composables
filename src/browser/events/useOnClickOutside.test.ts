import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, it, expect, vi } from 'vitest'
import { useOnClickOutside } from './useOnClickOutside'

describe('useOnClickOutside', () => {
  it('should call handler when clicking outside', () => {
    const handler = vi.fn()
    const target = ref(document.createElement('div'))

    mount({
      template: '<div></div>',
      setup() {
        useOnClickOutside(target, handler)
        return {}
      },
    })

    document.body.dispatchEvent(new MouseEvent('click'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should not call handler when clicking inside', () => {
    const handler = vi.fn()
    const target = ref(document.createElement('div'))

    mount({
      template: '<div></div>',
      setup() {
        useOnClickOutside(target, handler)
        return {}
      },
    })

    target.value.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(handler).not.toHaveBeenCalled()
  })
})
