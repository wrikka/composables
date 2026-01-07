import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, defineComponent, type Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const createComponent = (sourceRef: Ref<any>, callback: (value: any) => void, options: any) => {
    return mount(defineComponent({
      setup() {
        return useDebounce(sourceRef, callback, options)
      },
      template: '<div></div>',
    }))
  }

  it('should debounce the callback', () => {
    const source = ref(0)
    const callback = vi.fn()
    createComponent(source, callback, { delay: 500 })

    source.value = 1
    source.value = 2
    source.value = 3

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(3)
  })

  it('should call immediately if immediate is true', () => {
    const source = ref(0)
    const callback = vi.fn()
    createComponent(source, callback, { delay: 500, immediate: true })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(0)
  })

  it('should handle leading edge calls', () => {
    const source = ref(0)
    const callback = vi.fn()
    createComponent(source, callback, { delay: 500, onLeading: true, onTrailing: false })

    source.value = 1
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1)

    vi.advanceTimersByTime(500)
    expect(callback).toHaveBeenCalledTimes(1) // Should not call again on trailing edge
  })

  it('should respect maxWait', () => {
    const source = ref(0)
    const callback = vi.fn()
    createComponent(source, callback, { delay: 500, maxWait: 1000 })

    source.value = 1
    vi.advanceTimersByTime(400)
    source.value = 2
    vi.advanceTimersByTime(400)
    source.value = 3
    vi.advanceTimersByTime(400)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(2) // Called at 800ms due to maxWait
  })

  it('should flush pending calls', () => {
    const source = ref(0)
    const callback = vi.fn()
    const wrapper = createComponent(source, callback, { delay: 500 })

    source.value = 1
    expect(callback).not.toHaveBeenCalled()

    wrapper.vm.flush()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1)
  })

  it('should cancel pending calls', () => {
    const source = ref(0)
    const callback = vi.fn()
    const wrapper = createComponent(source, callback, { delay: 500 })

    source.value = 1
    expect(callback).not.toHaveBeenCalled()

    wrapper.vm.cancel()
    vi.advanceTimersByTime(500)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should update debouncedValue', () => {
    const source = ref('initial')
    const callback = vi.fn()
    const wrapper = createComponent(source, callback, { delay: 500 })

    expect(wrapper.vm.debouncedValue).toBe('initial')

    source.value = 'updated'
    vi.advanceTimersByTime(500)

    expect(wrapper.vm.debouncedValue).toBe('updated')
  })

  it('should clean up timers on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    const source = ref(0)
    const callback = vi.fn()
    const wrapper = createComponent(source, callback, { delay: 500 })

    source.value = 1
    wrapper.unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
