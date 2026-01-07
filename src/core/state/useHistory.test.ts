import { describe, it, expect } from 'vitest'
import { useHistory } from './useHistory'

describe('useHistory', () => {
  it('should initialize with default values', () => {
    const { history, currentIndex, current, canUndo, canRedo } = useHistory<string>()

    expect(history.value).toEqual([])
    expect(currentIndex.value).toBe(-1)
    expect(current.value).toBe(null)
    expect(canUndo.value).toBe(false)
    expect(canRedo.value).toBe(false)
  })

  it('should initialize with initial values', () => {
    const { history, currentIndex, current } = useHistory({
      initial: ['a', 'b', 'c']
    })

    expect(history.value).toEqual(['a', 'b', 'c'])
    expect(currentIndex.value).toBe(0)
    expect(current.value).toBe('a')
  })

  it('should push new values', () => {
    const { history, currentIndex, current, canUndo, canRedo } = useHistory<string>()

    // @ts-ignore
    history.push('test')
    
    expect(history.value).toEqual(['test'])
    expect(currentIndex.value).toBe(0)
    expect(current.value).toBe('test')
    expect(canUndo.value).toBe(false)
    expect(canRedo.value).toBe(false)
  })

  it('should handle undo and redo', () => {
    const { push, undo, redo, current, canUndo, canRedo } = useHistory<string>()

    push('a')
    push('b')
    push('c')

    expect(current.value).toBe('c')
    expect(canUndo.value).toBe(true)
    expect(canRedo.value).toBe(false)

    const undone = undo()
    expect(undone).toBe('b')
    expect(current.value).toBe('b')
    expect(canUndo.value).toBe(true)
    expect(canRedo.value).toBe(true)

    const redone = redo()
    expect(redone).toBe('c')
    expect(current.value).toBe('c')
    expect(canUndo.value).toBe(true)
    expect(canRedo.value).toBe(false)
  })

  it('should respect capacity limit', () => {
    const { history, push } = useHistory({ capacity: 3 })

    push('a')
    push('b')
    push('c')
    push('d')

    expect(history.value).toEqual(['b', 'c', 'd'])
  })

  it('should clear history', () => {
    const { history, currentIndex, current, clear } = useHistory({ initial: ['a', 'b'] })

    clear()

    expect(history.value).toEqual([])
    expect(currentIndex.value).toBe(-1)
    expect(current.value).toBe(null)
  })
})
