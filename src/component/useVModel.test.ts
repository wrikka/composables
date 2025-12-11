import { describe, it, expect, vi } from 'vitest'
import { reactive } from 'vue'
import { useVModel } from './useVModel'

// Mock Vue's getCurrentInstance
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  const mockEmit = vi.fn()
  return {
    ...actual,
    getCurrentInstance: () => ({
      emit: mockEmit,
    }),
    mockEmit, // export for checking calls
  }
})

describe('useVModel', () => {
  it('should get the initial value from props', () => {
    const props = reactive({ modelValue: 'initial' })
    const model = useVModel(props, 'modelValue')
    expect(model.value).toBe('initial')
  })

  it('should emit update event on set', async () => {
    // The mock is defined at the top level of the file
    const vue = await import('vue')
    const mockEmit = (vue as any).mockEmit
    mockEmit.mockClear()

    const props = reactive({ modelValue: 'initial' })
    const model = useVModel(props, 'modelValue')

    model.value = 'updated'

    expect(mockEmit).toHaveBeenCalledTimes(1)
    expect(mockEmit).toHaveBeenCalledWith('update:modelValue', 'updated')
  })
})
