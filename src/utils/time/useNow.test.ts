import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useNow } from './useNow'

describe('useNow', () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z')
  let dateSpy: any // Using any to bypass the type issue, as type inference should handle it.

  beforeEach(() => {
    vi.useFakeTimers()
    dateSpy = vi.spyOn(global, 'Date').mockImplementation(() => mockDate)
  })

  afterEach(() => {
    vi.useRealTimers()
    dateSpy.mockRestore()
  })

  const createComponent = (options: any) => {
    return mount(defineComponent({
      setup() {
        return useNow(options)
      },
      template: '<div></div>',
    }))
  }

  it('should start immediately and set the initial time', () => {
    const wrapper = createComponent({ immediate: true })
    expect(wrapper.vm.now).toEqual(mockDate)
    expect(wrapper.vm.isActive).toBe(true)
  })

  it('should not start immediately when immediate is false', () => {
    const wrapper = createComponent({ immediate: false })
    expect(wrapper.vm.isActive).toBe(false)
  })

  it('should update the time after the interval', () => {
    const wrapper = createComponent({ interval: 1000 })
    const newMockDate = new Date('2023-01-01T00:00:01.000Z')
    dateSpy.mockImplementation(() => newMockDate)

    vi.advanceTimersByTime(1000)

    expect(wrapper.vm.now).toEqual(newMockDate)
  })

  it('should pause and resume the timer', () => {
    const wrapper = createComponent({ interval: 1000 })
    expect(wrapper.vm.isActive).toBe(true)

    wrapper.vm.pause()
    expect(wrapper.vm.isActive).toBe(false)

    const newMockDate = new Date('2023-01-01T00:00:01.000Z')
    dateSpy.mockImplementation(() => newMockDate)
    vi.advanceTimersByTime(1000)
    expect(wrapper.vm.now).toEqual(mockDate) // Should not have updated

    wrapper.vm.resume()
    expect(wrapper.vm.isActive).toBe(true)
    vi.advanceTimersByTime(1000)
    expect(wrapper.vm.now).toEqual(newMockDate)
  })

  it('should stop the timer', () => {
    const wrapper = createComponent({ interval: 1000 })
    wrapper.vm.stop()
    expect(wrapper.vm.isActive).toBe(false)

    const newMockDate = new Date('2023-01-01T00:00:01.000Z')
    dateSpy.mockImplementation(() => newMockDate)
    vi.advanceTimersByTime(1000)

    expect(wrapper.vm.now).toEqual(mockDate) // Should not have updated
  })

  it('should clean up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    const wrapper = createComponent({})
    wrapper.unmount()
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1)
  })
})
