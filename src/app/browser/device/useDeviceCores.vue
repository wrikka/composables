<script setup lang="ts">
import { useDeviceCores } from './useDeviceCores'

const { cores, hardwareConcurrency } = useDeviceCores()
</script>

<template>
  <div>
    <h2>Device Cores</h2>
    <div v-if="cores !== null">
      <p>CPU Cores: {{ cores }}</p>
      <p>Hardware Concurrency: {{ hardwareConcurrency }}</p>
    </div>
    <div v-else>
      <p>Hardware Concurrency API not available</p>
    </div>
  </div>
</template>
