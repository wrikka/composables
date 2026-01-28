<script setup lang="ts">
import { useNetworkJitter } from './useNetworkJitter'

const { jitter, jitterHistory, averageJitter } = useNetworkJitter()
</script>

<template>
  <div>
    <h2>Network Jitter</h2>
    <div v-if="jitter !== null">
      <p>Current Jitter: {{ jitter.toFixed(2) }} ms</p>
      <p>Average Jitter: {{ averageJitter?.toFixed(2) }} ms</p>
      <p>History Size: {{ jitterHistory.length }}</p>
    </div>
    <div v-else>
      <p>Measuring jitter...</p>
    </div>
  </div>
</template>
