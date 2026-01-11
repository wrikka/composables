<template>
  <div>
    <h2>useAccelerometer</h2>
    <p v-if="!isSupported">Accelerometer API not supported</p>
    <template v-else>
      <p>x: {{ x?.toFixed(2) }}</p>
      <p>y: {{ y?.toFixed(2) }}</p>
      <p>z: {{ z?.toFixed(2) }}</p>
    </template>
  </div>
</template>

<script setup>
import { useAccelerometer } from "./useAccelerometer";

const { isSupported, x, y, z } = useAccelerometer();
</script>
