<script setup lang="ts">
import { ref } from 'vue'
import { useSpring } from './useSpring'

const target = ref(0)
const value = useSpring(target, { stiffness: 100, damping: 20 })
</script>

<template>
  <div>
    <p>Spring Value: {{ value.toFixed(2) }}</p>
    <button @click="target = 100">Spring to 100</button>
    <button @click="target = 0">Spring to 0</button>
    <button @click="target = Math.random() * 200 - 100">Spring to random</button>
  </div>
</template>
