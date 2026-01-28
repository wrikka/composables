<script setup lang="ts">
import { useNetworkQuality } from './useNetworkQuality'

const { quality, score, latency, jitter, packetLoss, bandwidth } = useNetworkQuality()
</script>

<template>
  <div>
    <h2>Network Quality</h2>
    <div v-if="quality !== null">
      <p>Quality: {{ quality }}</p>
      <p>Score: {{ score?.toFixed(0) }}/100</p>
      <p>Latency: {{ latency?.toFixed(2) }} ms</p>
      <p>Jitter: {{ jitter?.toFixed(2) }} ms</p>
      <p>Packet Loss: {{ packetLoss?.toFixed(2) }}%</p>
      <p>Bandwidth: {{ bandwidth?.toFixed(2) }} Mbps</p>
    </div>
    <div v-else>
      <p>Measuring network quality...</p>
    </div>
  </div>
</template>
