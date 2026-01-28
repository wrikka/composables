import { describe, it, expect } from 'vitest'
import { useDragDrop } from './useDragDrop'

describe('useDragDrop', () => {
  it('should handle drag start', () => {
    const { onDragStart, isDragging, dragData } = useDragDrop()
    onDragStart({ id: 1 })

    expect(isDragging.value).toBe(true)
    expect(dragData.value).toEqual({ id: 1 })
  })

  it('should handle drag end', () => {
    const { onDragStart, onDragEnd, isDragging, dragData } = useDragDrop()
    onDragStart({ id: 1 })
    onDragEnd()

    expect(isDragging.value).toBe(false)
    expect(dragData.value).toBeNull()
  })

  it('should handle drop', () => {
    const { onDrop } = useDragDrop()
    const result = onDrop({ id: 1 })

    expect(result).toEqual({ id: 1 })
  })
})
