import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useSum } from './useSum'

describe('useSum', () => {
  it('should calculate the sum of an array of numbers', () => {
    const numbers = ref([1, 2, 3, 4, 5])
    const { sum } = useSum(numbers)
    expect(sum.value).toBe(15)
  })

  it('should return 0 for an empty array', () => {
    const numbers = ref([])
    const { sum } = useSum(numbers)
    expect(sum.value).toBe(0)
  })

  it('should be reactive to changes in the array', async () => {
    const numbers = ref([10, 20])
    const { sum } = useSum(numbers)
    expect(sum.value).toBe(30)

    numbers.value.push(30)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(sum.value).toBe(60)
  })
})
