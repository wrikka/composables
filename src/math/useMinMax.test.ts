import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useMinMax } from './useMinMax'

describe('useMinMax', () => {
  it('should find the min and max of an array of numbers', () => {
    const numbers = ref([1, 5, 2, 8, 3])
    const { min, max } = useMinMax(numbers)
    expect(min.value).toBe(1)
    expect(max.value).toBe(8)
  })

  it('should return undefined for an empty array', () => {
    const numbers = ref([])
    const { min, max } = useMinMax(numbers)
    expect(min.value).toBeUndefined()
    expect(max.value).toBeUndefined()
  })

  it('should be reactive to changes in the array', async () => {
    const numbers = ref([10, 20])
    const { min, max } = useMinMax(numbers)
    expect(min.value).toBe(10)
    expect(max.value).toBe(20)

    numbers.value.push(5)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(min.value).toBe(5)

    numbers.value.push(100)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(max.value).toBe(100)
  })
})
