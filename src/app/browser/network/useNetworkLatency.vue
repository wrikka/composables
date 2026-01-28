<script setup lang="ts">
import { useNetworkLatency } from './useNetworkLatency'

const { latency, rtt, ping } = useNetworkLatency()
</script>

<template>
  <div>
    <h2>Network Latency</h2>
    <div v-if="latency !== null">
      <p>Latency: {{ latency.toFixed(2) }} ms</p>
      <p>RTT: {{ rtt?.toFixed(2) }} ms</p>
      <p>Ping: {{ ping?.toFixed(2) }} ms</p>
    </div>
    <div v-else>
      <p>Measuring latency...</p>
    </div>
  </div>
</template>
