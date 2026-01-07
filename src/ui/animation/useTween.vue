<script setup lang="ts">
import { ref } from 'vue'
import { useTween } from './useTween'
import { easeInOutCubic } from './easing'

const from = ref(0)
const to = ref(1000)

const tweenedValue = useTween(from, to, {
  duration: 2000,
  easing: easeInOutCubic,
})
</script>

<template>
  <div>
    <p>Tweened Value: {{ tweenedValue.toFixed(2) }}</p>
    <button @click="to = Math.random() * 1000">Animate to random</button>
  </div>
</template>
