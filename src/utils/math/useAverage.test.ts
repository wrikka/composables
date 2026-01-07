import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useAverage } from './useAverage'

describe('useAverage', () => {
  it('should calculate the average of an array of numbers', () => {
    const numbers = ref([1, 2, 3, 4, 5])
    const { average } = useAverage(numbers)
    expect(average.value).toBe(3)
  })

  it('should return 0 for an empty array', () => {
    const numbers = ref([])
    const { average } = useAverage(numbers)
    expect(average.value).toBe(0)
  })

  it('should be reactive to changes in the array', async () => {
    const numbers = ref([10, 20])
    const { average } = useAverage(numbers)
    expect(average.value).toBe(15)

    numbers.value.push(30)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(average.value).toBe(20)
  })
})
