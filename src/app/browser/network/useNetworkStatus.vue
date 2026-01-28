<script setup lang="ts">
import { useNetworkStatus } from './useNetworkStatus'

const {
  isOnline,
  offlineAt,
  downlink,
  effectiveType,
  rtt,
  saveData,
  status,
} = useNetworkStatus()
</script>

<template>
  <div class="p-5 border border-gray-300 rounded-lg">
    <h2>Network Status Demo</h2>
    <div class="my-3.75">
      <p>Online: {{ isOnline }}</p>
      <p>Offline At: {{ offlineAt }}</p>
      <p>Downlink: {{ downlink }} Mbps</p>
      <p>Effective Type: {{ effectiveType }}</p>
      <p>RTT: {{ rtt }} ms</p>
      <p>Save Data: {{ saveData }}</p>
    </div>
    <div class="my-3.75">
      <h3>Complete Info</h3>
      <pre class="bg-gray-100 p-2.5 rounded overflow-x-auto">{{ JSON.stringify(status, null, 2) }}</pre>
    </div>
  </div>
</template>

