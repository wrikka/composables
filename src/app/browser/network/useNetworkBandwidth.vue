<script setup lang="ts">
import { useNetworkBandwidth } from './useNetworkBandwidth'

const { bandwidth, bandwidthHistory, averageBandwidth, unit } = useNetworkBandwidth()
</script>

<template>
  <div>
    <h2>Network Bandwidth</h2>
    <div v-if="bandwidth !== null">
      <p>Bandwidth: {{ bandwidth.toFixed(2) }} {{ unit }}</p>
      <p>Average Bandwidth: {{ averageBandwidth?.toFixed(2) }} {{ unit }}</p>
      <p>History Size: {{ bandwidthHistory.length }}</p>
    </div>
    <div v-else>
      <p>Measuring bandwidth...</p>
    </div>
  </div>
</template>
