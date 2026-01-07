import { ref } from 'vue'
import { describe, it, expect } from 'vitest'
import { useFilter } from './useFilter'

describe('useFilter', () => {
  const data = ref([
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
    { id: 3, name: 'Charlie', age: 35 },
    { id: 4, name: 'David', age: 30 },
  ])

  it('should return original data when no filters are applied', () => {
    const { filteredData } = useFilter(data)
    expect(filteredData.value).toEqual(data.value)
  })

  it('should filter data based on a single filter', () => {
    const { filteredData, addFilter } = useFilter(data)
    const filterByAge = (item: { age: number }) => item.age === 30
    addFilter(filterByAge)
    expect(filteredData.value).toEqual([
      { id: 2, name: 'Bob', age: 30 },
      { id: 4, name: 'David', age: 30 },
    ])
  })

  it('should filter data based on multiple filters', () => {
    const { filteredData, addFilter } = useFilter(data)
    const filterByAge = (item: { age: number }) => item.age === 30
    const filterByName = (item: { name: string }) => item.name === 'Bob'
    addFilter(filterByAge)
    addFilter(filterByName)
    expect(filteredData.value).toEqual([{ id: 2, name: 'Bob', age: 30 }])
  })

  it('should remove a filter', () => {
    const { filteredData, addFilter, removeFilter } = useFilter(data)
    const filterByAge = (item: { age: number }) => item.age === 30
    addFilter(filterByAge)
    expect(filteredData.value.length).toBe(2)
    removeFilter(filterByAge)
    expect(filteredData.value.length).toBe(4)
  })

  it('should clear all filters', () => {
    const { filteredData, addFilter, clearFilters } = useFilter(data)
    const filterByAge = (item: { age: number }) => item.age === 30
    const filterByName = (item: { name: string }) => item.name.startsWith('A')
    addFilter(filterByAge)
    addFilter(filterByName)
    clearFilters()
    expect(filteredData.value.length).toBe(4)
  })

  it('should work with initial filters', () => {
    const filterByAge = (item: { age: number }) => item.age > 30
    const { filteredData } = useFilter(data, {
      initialFilters: ref([filterByAge]),
    })
    expect(filteredData.value).toEqual([{ id: 3, name: 'Charlie', age: 35 }])
  })
})
