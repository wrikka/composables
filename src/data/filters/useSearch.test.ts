import { describe, it, expect } from 'vitest'
import { useSearch, useAdvancedSearch } from './useSearch'

interface User {
  id: number
  name: string
  email: string
  age: number
  active: boolean
}

describe('useSearch', () => {
  const users: User[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 30, active: true },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 25, active: false },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', age: 35, active: true },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', age: 28, active: true }
  ]

  it('should return all items when query is empty', () => {
    const { filteredItems, query } = useSearch(users)

    expect(filteredItems.value).toEqual(users)
    expect(query.value).toBe('')
  })

  it('should search across all fields by default', () => {
    const { filteredItems, search } = useSearch(users)

    search('alice')
    expect(filteredItems.value).toHaveLength(1)
    expect(filteredItems.value[0]?.name).toBe('Alice Johnson')

    search('example.com')
    expect(filteredItems.value).toHaveLength(4) // All have example.com

    search('30')
    expect(filteredItems.value).toHaveLength(1)
    expect(filteredItems.value[0]?.age).toBe(30)
  })

  it('should search in specific keys', () => {
    const { filteredItems, search } = useSearch(users, { keys: ['name'] })

    search('alice')
    expect(filteredItems.value).toHaveLength(1)

    search('example.com')
    expect(filteredItems.value).toHaveLength(0) // Not searching in email field
  })

  it('should handle case sensitivity', () => {
    const { filteredItems, search } = useSearch(users, { caseSensitive: true })

    search('ALICE')
    expect(filteredItems.value).toHaveLength(0)

    search('Alice')
    expect(filteredItems.value).toHaveLength(1)

    const { filteredItems: caseInsensitive } = useSearch(users, { caseSensitive: false })
    search('ALICE')
    expect(caseInsensitive.value).toHaveLength(1)
  })

  it('should handle fuzzy search', () => {
    const { filteredItems, search } = useSearch(users, { fuzzy: true, threshold: 0.6 })

    search('alic') // Should match "Alice"
    expect(filteredItems.value).toHaveLength(1)
    expect(filteredItems.value[0]?.name).toBe('Alice Johnson')

    search('chr') // Should match "Charlie"
    expect(filteredItems.value).toHaveLength(1)
    expect(filteredItems.value[0]?.name).toBe('Charlie Brown')
  })

  it('should manage search keys dynamically', () => {
    const { filteredItems, search, setKeys, addKey, removeKey } = useSearch(users, { keys: ['name'] })

    search('alice')
    expect(filteredItems.value).toHaveLength(1)

    addKey('email')
    search('example.com')
    expect(filteredItems.value).toHaveLength(4) // Now searching in email too

    removeKey('name')
    search('alice')
    expect(filteredItems.value).toHaveLength(0) // No longer searching in name

    setKeys(['name', 'age'])
    search('30')
    expect(filteredItems.value).toHaveLength(1)
  })

  it('should provide computed properties', () => {
    const { hasResults, resultCount, isEmpty, search } = useSearch(users)

    expect(isEmpty.value).toBe(true)
    expect(hasResults.value).toBe(true)
    expect(resultCount.value).toBe(4)

    search('nonexistent')
    expect(isEmpty.value).toBe(false)
    expect(hasResults.value).toBe(false)
    expect(resultCount.value).toBe(0)

    search('alice')
    expect(isEmpty.value).toBe(false)
    expect(hasResults.value).toBe(true)
    expect(resultCount.value).toBe(1)
  })

  it('should clear search', () => {
    const { filteredItems, search, clear } = useSearch(users)

    search('alice')
    expect(filteredItems.value).toHaveLength(1)

    clear()
    expect(filteredItems.value).toEqual(users)
  })

  it('should handle null/undefined values', () => {
    const itemsWithNull = [
      { id: 1, name: 'Alice', email: null, age: 30 },
      { id: 2, name: null, email: 'bob@example.com', age: 25 }
    ]

    const { filteredItems, search } = useSearch(itemsWithNull)

    search('alice')
    expect(filteredItems.value).toHaveLength(1)

    search('bob')
    expect(filteredItems.value).toHaveLength(1)

    search('null')
    expect(filteredItems.value).toHaveLength(0)
  })
})

describe('useAdvancedSearch', () => {
  const products = [
    { id: 1, name: 'Laptop', price: 999, category: 'Electronics', inStock: true },
    { id: 2, name: 'Book', price: 19, category: 'Books', inStock: true },
    { id: 3, name: 'Phone', price: 699, category: 'Electronics', inStock: false },
    { id: 4, name: 'Desk', price: 299, category: 'Furniture', inStock: true }
  ]

  it('should combine text search with filters', () => {
    const { filteredItems, search, addFilter } = useAdvancedSearch(products)

    search('laptop')
    expect(filteredItems.value).toHaveLength(1)

    addFilter({ key: 'inStock', operator: 'equals', value: true })
    expect(filteredItems.value).toHaveLength(1) // Laptop is in stock

    search('phone')
    expect(filteredItems.value).toHaveLength(0) // Phone exists but not in stock
  })

  it('should apply multiple filters', () => {
    const { filteredItems, addFilter } = useAdvancedSearch(products)

    addFilter({ key: 'category', operator: 'equals', value: 'Electronics' })
    addFilter({ key: 'inStock', operator: 'equals', value: true })
    
    expect(filteredItems.value).toHaveLength(1) // Only Laptop matches both
  })

  it('should handle different filter operators', () => {
    const { filteredItems, addFilter } = useAdvancedSearch(products)

    addFilter({ key: 'price', operator: 'gte', value: 500 })
    expect(filteredItems.value).toHaveLength(2) // Laptop and Phone

    addFilter({ key: 'price', operator: 'lte', value: 800 })
    expect(filteredItems.value).toHaveLength(1) // Only Phone

    const { filteredItems: containsFilter } = useAdvancedSearch(products)
    addFilter({ key: 'name', operator: 'contains', value: 'lap' })
    expect(containsFilter.value).toHaveLength(1) // Laptop
  })

  it('should remove filters', () => {
    const { filteredItems, addFilter, removeFilter } = useAdvancedSearch(products)

    addFilter({ key: 'category', operator: 'equals', value: 'Electronics' })
    expect(filteredItems.value).toHaveLength(2)

    removeFilter('category')
    expect(filteredItems.value).toHaveLength(4)
  })

  it('should clear all filters and search', () => {
    const { filteredItems, search, addFilter, clearFilters, clear } = useAdvancedSearch(products)

    search('laptop')
    addFilter({ key: 'inStock', operator: 'equals', value: true })
    expect(filteredItems.value).toHaveLength(1)

    clearFilters()
    expect(filteredItems.value).toHaveLength(1) // Still has search

    clear()
    expect(filteredItems.value).toHaveLength(4) // All cleared
  })

  it('should update existing filter', () => {
    const { filteredItems, addFilter } = useAdvancedSearch(products)

    addFilter({ key: 'price', operator: 'gte', value: 100 })
    expect(filteredItems.value).toHaveLength(3)

    addFilter({ key: 'price', operator: 'gte', value: 700 })
    expect(filteredItems.value).toHaveLength(2) // Laptop and Phone
  })
})
