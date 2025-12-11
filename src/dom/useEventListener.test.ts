import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { useEventListener } from './useEventListener'

describe('useEventListener', () => {
  it('should add and remove event listener', async () => {
    const handler = vi.fn()
    const target = ref(document.createElement('div'))

    const TestComponent = defineComponent({
      setup() {
        useEventListener(target, 'click', handler)
        return () => h('div', { ref: 'target' })
      },
    })

    const wrapper = mount(TestComponent)

    // Attach target to the DOM to receive events
    document.body.appendChild(target.value)

    await target.value.dispatchEvent(new MouseEvent('click'))
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()

    await target.value.dispatchEvent(new MouseEvent('click'))
    // Handler should have been removed on unmount
    expect(handler).toHaveBeenCalledTimes(1)

    document.body.removeChild(target.value)
  })
})
