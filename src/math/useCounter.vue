<template>
  <div>
    <h2>useCounter</h2>
    <p>Count: {{ count }}</p>
    <button @click="inc()">Increment</button>
    <button @click="dec()">Decrement</button>
    <button @click="inc(5)">Increment by 5</button>
    <button @click="dec(5)">Decrement by 5</button>
    <button @click="set(100)">Set to 100</button>
    <button @click="reset">Reset</button>
  </div>
</template>

<script setup>
import { useCounter } from './useCounter'

const { count, inc, dec, set, reset } = useCounter(0)
</script>
