import { describe, it, expect } from 'vitest'
import { createGlobalState } from './createGlobalState'

describe('createGlobalState', () => {
  it('should create a global state', () => {
    const useCounter = createGlobalState(0)

    const counter1 = useCounter()
    const counter2 = useCounter()

    expect(counter1.value).toBe(0)
    expect(counter2.value).toBe(0)

    counter1.value = 5

    expect(counter1.value).toBe(5)
    expect(counter2.value).toBe(5)
  })

  it('should work with objects', () => {
    const useUser = createGlobalState({ name: 'John' })

    const user1 = useUser()
    const user2 = useUser()

    expect(user1.value.name).toBe('John')
    expect(user2.value.name).toBe('John')

    user1.value.name = 'Jane'

    expect(user1.value.name).toBe('Jane')
    expect(user2.value.name).toBe('Jane')
  })
})
