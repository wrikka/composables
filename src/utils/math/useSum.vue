<template>
  <div>
    <h2>useSum</h2>
    <p>Numbers: {{ numbers }}</p>
    <p>Sum: {{ sum }}</p>
    <input v-model.number="newNumber" type="number" @keyup.enter="addNumber" />
    <button @click="addNumber">Add Number</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSum } from './useSum'

const numbers = ref([1, 2, 3, 4, 5])
const newNumber = ref(6)
const { sum } = useSum(numbers)

const addNumber = () => {
  if (typeof newNumber.value === 'number') {
    numbers.value.push(newNumber.value)
    newNumber.value = 0
  }
}
</script>
