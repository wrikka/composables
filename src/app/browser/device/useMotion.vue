<script setup lang="ts">
import { useMotion } from './useMotion'

const { acceleration, rotationRate, interval } = useMotion()
</script>

<template>
  <div>
    <h2>Motion</h2>
    <p>Acceleration X: {{ acceleration.x }}</p>
    <p>Acceleration Y: {{ acceleration.y }}</p>
    <p>Acceleration Z: {{ acceleration.z }}</p>
    <p>Rotation Alpha: {{ rotationRate.alpha }}</p>
    <p>Rotation Beta: {{ rotationRate.beta }}</p>
    <p>Rotation Gamma: {{ rotationRate.gamma }}</p>
    <p>Interval: {{ interval }}</p>
  </div>
</template>
