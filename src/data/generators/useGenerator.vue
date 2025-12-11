<template>
  <div>
    <h2>useGenerator</h2>
    <p>Current value: {{ currentValue }}</p>
    <button @click="next()">Next</button>
    <p v-if="isDone">Generator is done.</p>
  </div>
</template>

<script setup>
import { useGenerator } from '../useGenerator'

// A simple generator function that yields numbers from 1 to 5
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
}

const { currentValue, next, isDone } = useGenerator(numberGenerator())
</script>
