import { ref } from 'vue'
import { describe, it, expect } from 'vitest'
import { useSort } from './useSort'

describe('useSort', () => {
  const data = ref([
    { id: 3, name: 'Charlie' },
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ])

  it('should not sort if no key is provided', () => {
    const { sortedData } = useSort(data)
    expect(sortedData.value).toEqual(data.value)
  })

  it('should sort by key in ascending order by default', () => {
    const { sortedData, sortBy } = useSort(data)
    sortBy('id')
    expect(sortedData.value).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ])
  })

  it('should toggle sort order when sorting by the same key', () => {
    const { sortedData, sortBy } = useSort(data)
    sortBy('name') // asc
    expect(sortedData.value[0]!.name).toBe('Alice')
    sortBy('name') // desc
    expect(sortedData.value[0]!.name).toBe('Charlie')
  })

  it('should reset sort order to asc when sorting by a new key', () => {
    const { sortedData, sortBy, sortOrder } = useSort(data)
    sortBy('id')
    sortBy('id') // desc
    expect(sortOrder.value).toBe('desc')
    sortBy('name') // asc
    expect(sortOrder.value).toBe('asc')
    expect(sortedData.value[0]!.name).toBe('Alice')
  })

  it('should work with initial sorter', () => {
    const { sortedData } = useSort(data, { key: 'id', order: 'desc' })
    expect(sortedData.value).toEqual([
      { id: 3, name: 'Charlie' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' },
    ])
  })
})
