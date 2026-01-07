import { ref } from 'vue'
import { describe, it, expect, vi } from 'vitest'
import { useInlineEdit } from './useInlineEdit'

describe('useInlineEdit', () => {
  const initialItem = { id: 1, name: 'Alice' }
  const onSave = vi.fn().mockResolvedValue(undefined)

  it('should initialize with default values', () => {
    const item = ref({ ...initialItem })
    const { isEditing, value } = useInlineEdit(item, 'name', onSave)

    expect(isEditing.value).toBe(false)
    expect(value.value).toBe('Alice')
  })

  it('should start editing', () => {
    const item = ref({ ...initialItem })
    const { isEditing, startEditing } = useInlineEdit(item, 'name', onSave)

    startEditing()
    expect(isEditing.value).toBe(true)
  })

  it('should cancel editing and revert value', () => {
    const item = ref({ ...initialItem })
    const { isEditing, value, startEditing, cancelEditing } = useInlineEdit(item, 'name', onSave)

    startEditing()
    value.value = 'Alicia'
    cancelEditing()

    expect(isEditing.value).toBe(false)
    expect(value.value).toBe('Alice')
  })

  it('should save the new value and call onSave', async () => {
    const item = ref({ ...initialItem })
    const { isEditing, value, startEditing, save } = useInlineEdit(item, 'name', onSave)

    startEditing()
    value.value = 'Alicia'
    await save()

    expect(isEditing.value).toBe(false)
    expect(onSave).toHaveBeenCalledWith({ id: 1, name: 'Alicia' })
  })

  it('should not call onSave if value has not changed', async () => {
    const item = ref({ ...initialItem })
    const { save, startEditing } = useInlineEdit(item, 'name', onSave)
    onSave.mockClear()

    startEditing()
    await save()

    expect(onSave).not.toHaveBeenCalled()
  })
})
