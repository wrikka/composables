<template>
  <div>
    <h2>useAverage</h2>
    <p>Numbers: {{ numbers }}</p>
    <p>Average: {{ average }}</p>
    <input v-model.number="newNumber" type="number" @keyup.enter="addNumber" />
    <button @click="addNumber">Add Number</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAverage } from "./useAverage";

const numbers = ref([1, 2, 3, 4, 5]);
const newNumber = ref(6);
const { average } = useAverage(numbers);

const _addNumber = () => {
	if (typeof newNumber.value === "number") {
		numbers.value.push(newNumber.value);
		newNumber.value = 0;
	}
};
</script>
