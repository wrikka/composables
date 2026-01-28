<script setup lang="ts">
import { useDeviceThermal } from './useDeviceThermal'

const { temperature, overheated } = useDeviceThermal()
</script>

<template>
  <div>
    <h2>Device Thermal Status</h2>
    <div v-if="temperature !== null">
      <p>Temperature: {{ temperature }}°C</p>
      <p>Overheated: {{ overheated ? 'Yes' : 'No' }}</p>
    </div>
    <div v-else>
      <p>Thermal API not available</p>
    </div>
  </div>
</template>
