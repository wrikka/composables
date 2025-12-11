<script setup lang="ts">
import { useConnection } from './useConnection'

const { 
  isSupported, 
  connection,
  online,
  getConnectionQuality
} = useConnection()
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">useConnection</h2>
    <p v-if="!isSupported">Network Connection API not supported</p>
    <template v-else>
      <p>Online: <span class="font-mono" :class="online ? 'text-green-500' : 'text-red-500'">{{ online }}</span></p>
      <p>Quality: <span class="font-mono">{{ getConnectionQuality() }}</span></p>
      <div v-if="connection" class="font-mono text-sm space-y-1 bg-gray-100 p-2 rounded mt-2">
        <p>Type: {{ connection.type }}</p>
        <p>Effective Type: {{ connection.effectiveType }}</p>
        <p>Downlink: {{ connection.downlink }} Mbps</p>
        <p>Downlink Max: {{ connection.downlinkMax }} Mbps</p>
        <p>RTT: {{ connection.rtt }} ms</p>
        <p>Save Data: {{ connection.saveData }}</p>
      </div>
    </template>
  </div>
</template>
