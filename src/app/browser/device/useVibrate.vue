<script setup lang="ts">
import { useVibrate } from './useVibrate'

const { isVibrating, vibrate, stop } = useVibrate()
</script>

<template>
  <div>
    <h2>Vibrate</h2>
    <button @click="vibrate(200)">Vibrate 200ms</button>
    <button @click="vibrate([100, 50, 100])">Pattern Vibrate</button>
    <button @click="stop">Stop</button>
    <p>Is Vibrating: {{ isVibrating }}</p>
  </div>
</template>
