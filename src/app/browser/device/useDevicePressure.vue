<script setup lang="ts">
import { useDevicePressure } from './useDevicePressure'

const { cpuPressure, memoryPressure, overallPressure } = useDevicePressure()
</script>

<template>
  <div>
    <h2>Device Pressure Status</h2>
    <div v-if="cpuPressure !== null">
      <p>CPU Pressure: {{ (cpuPressure * 100).toFixed(0) }}%</p>
      <p>Memory Pressure: {{ (memoryPressure * 100).toFixed(0) }}%</p>
      <p>Overall Pressure: {{ (overallPressure * 100).toFixed(0) }}%</p>
    </div>
    <div v-else>
      <p>Pressure API not available</p>
    </div>
  </div>
</template>
