import { describe, it, expect } from 'vitest'
import { useHistory } from './useHistory'

describe('useHistory', () => {
  it('should push state to history', () => {
    const { push, history } = useHistory()
    push('state1')
    push('state2')

    expect(history.value).toHaveLength(2)
  })

  it('should undo state', () => {
    const { push, undo, getCurrent } = useHistory()
    push('state1')
    push('state2')
    undo()

    expect(getCurrent()).toBe('state1')
  })

  it('should redo state', () => {
    const { push, undo, redo, getCurrent } = useHistory()
    push('state1')
    push('state2')
    undo()
    redo()

    expect(getCurrent()).toBe('state2')
  })

  it('should clear history', () => {
    const { push, clear, history } = useHistory()
    push('state1')
    clear()

    expect(history.value).toHaveLength(0)
  })

  it('should respect max size', () => {
    const { push, history } = useHistory({ maxSize: 3 })
    push('state1')
    push('state2')
    push('state3')
    push('state4')

    expect(history.value).toHaveLength(3)
  })
})
