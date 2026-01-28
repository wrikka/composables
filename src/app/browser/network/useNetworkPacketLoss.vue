<script setup lang="ts">
import { useNetworkPacketLoss } from './useNetworkPacketLoss'

const { packetLoss, packetLossHistory, averagePacketLoss } = useNetworkPacketLoss()
</script>

<template>
  <div>
    <h2>Network Packet Loss</h2>
    <div v-if="packetLoss !== null">
      <p>Packet Loss: {{ packetLoss.toFixed(2) }}%</p>
      <p>Average Packet Loss: {{ averagePacketLoss?.toFixed(2) }}%</p>
      <p>History Size: {{ packetLossHistory.length }}</p>
    </div>
    <div v-else>
      <p>Measuring packet loss...</p>
    </div>
  </div>
</template>
