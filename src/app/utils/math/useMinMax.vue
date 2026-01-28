<template>
  <div>
    <h2>useMinMax</h2>
    <p>Numbers: {{ numbers }}</p>
    <p>Min: {{ min }}</p>
    <p>Max: {{ max }}</p>
    <input v-model.number="newNumber" type="number" @keyup.enter="addNumber" />
    <button @click="addNumber">Add Number</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMinMax } from "./useMinMax";

const numbers = ref([10, 2, 8, 4, 6]);
const newNumber = ref(0);
const { min, max } = useMinMax(numbers);

const _addNumber = () => {
	if (typeof newNumber.value === "number") {
		numbers.value.push(newNumber.value);
		newNumber.value = 0;
	}
};
</script>
