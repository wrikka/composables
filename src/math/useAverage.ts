import { computed, Ref } from 'vue'

export function useAverage(numbers: Ref<number[]>) {
  const average = computed(() => {
    if (numbers.value.length === 0) {
      return 0
    }
    const sum = numbers.value.reduce((acc, val) => acc + val, 0)
    return sum / numbers.value.length
  })

  return { average }
}
