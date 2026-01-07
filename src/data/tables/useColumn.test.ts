import { describe, it, expect } from 'vitest'
import { useColumn, type Column } from './useColumn'

describe('useColumn', () => {
  interface Data {
    id: number
    name: string
  }

  const initialColumn: Column<Data> = {
    key: 'name',
    label: 'Name',
    isVisible: true,
    isResizable: false,
    width: 100,
  }

  it('should initialize with provided values', () => {
    const { column, isVisible, width } = useColumn(initialColumn)
    expect(column.value).toEqual(initialColumn)
    expect(isVisible.value).toBe(true)
    expect(width.value).toBe(100)
  })

  it('should default isVisible to true if not provided', () => {
    const col: Column<Data> = { key: 'id', label: 'ID' }
    const { isVisible } = useColumn(col)
    expect(isVisible.value).toBe(true)
  })

  it('should respect isVisible: false in initial config', () => {
    const col: Column<Data> = { key: 'id', label: 'ID', isVisible: false }
    const { isVisible } = useColumn(col)
    expect(isVisible.value).toBe(false)
  })

  it('should toggle visibility', () => {
    const { isVisible, toggleVisibility } = useColumn(initialColumn)
    toggleVisibility()
    expect(isVisible.value).toBe(false)
    toggleVisibility()
    expect(isVisible.value).toBe(true)
  })

  it('should set width if resizable', () => {
    const resizableColumn: Column<Data> = { ...initialColumn, isResizable: true }
    const { width, setWidth } = useColumn(resizableColumn)
    setWidth(200)
    expect(width.value).toBe(200)
  })

  it('should not set width if not resizable', () => {
    const { width, setWidth } = useColumn(initialColumn)
    setWidth(200)
    expect(width.value).toBe(100)
  })

  it('should compute headerClasses correctly', () => {
    const { headerClasses: nonResizableClasses } = useColumn(initialColumn)
    expect(nonResizableClasses.value).toEqual({ resizable: false })

    const resizableColumn: Column<Data> = { ...initialColumn, isResizable: true }
    const { headerClasses: resizableClasses } = useColumn(resizableColumn)
    expect(resizableClasses.value).toEqual({ resizable: true })
  })
})
