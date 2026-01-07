import { ref } from 'vue'
import { describe, it, expect } from 'vitest'
import { useSelection } from './useSelection'

describe('useSelection', () => {
  const data = ref([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ])

  it('should initialize with no items selected', () => {
    const { selected, noneSelected } = useSelection(data, 'id')
    expect(selected.value.size).toBe(0)
    expect(noneSelected.value).toBe(true)
  })

  it('should toggle selection for an item', () => {
    const { toggleSelection, isSelected } = useSelection(data, 'id')
    const item = data.value[0]!
    toggleSelection(item)
    expect(isSelected(item)).toBe(true)
    toggleSelection(item)
    expect(isSelected(item)).toBe(false)
  })

  it('should select all items', () => {
    const { selectAll, allSelected, selected } = useSelection(data, 'id')
    selectAll()
    expect(allSelected.value).toBe(true)
    expect(selected.value.size).toBe(data.value.length)
  })

  it('should clear selection', () => {
    const { selectAll, clearSelection, noneSelected } = useSelection(data, 'id')
    selectAll()
    clearSelection()
    expect(noneSelected.value).toBe(true)
  })

  it('should correctly compute someSelected', () => {
    const { toggleSelection, someSelected, allSelected } = useSelection(data, 'id')
    expect(someSelected.value).toBe(false)
    toggleSelection(data.value[0]!)
    expect(someSelected.value).toBe(true)
    toggleSelection(data.value[1]!)
    toggleSelection(data.value[2]!)
    expect(someSelected.value).toBe(false)
    expect(allSelected.value).toBe(true)
  })

  it('should return selected items', () => {
    const { toggleSelection, selectedItems } = useSelection(data, 'id')
    toggleSelection(data.value[0]!)
    toggleSelection(data.value[2]!)
    expect(selectedItems.value).toEqual([data.value[0], data.value[2]])
  })

  it('allSelected should be settable', () => {
    const { allSelected, selected } = useSelection(data, 'id')
    allSelected.value = true
    expect(selected.value.size).toBe(data.value.length)
    allSelected.value = false
    expect(selected.value.size).toBe(0)
  })
})
