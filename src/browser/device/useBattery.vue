<script setup lang="ts">
import { useBattery } from './useBattery'

const { isSupported, charging, chargingTime, dischargingTime, level } = useBattery()
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Battery Status</h2>
    <p v-if="!isSupported">Battery Status API not supported</p>
    <template v-else>
      <p>Charging: <span class="font-mono">{{ charging }}</span></p>
      <p>Charging Time: <span class="font-mono">{{ chargingTime }}</span></p>
      <p>Discharging Time: <span class="font-mono">{{ dischargingTime }}</span></p>
      <p>Level: <span class="font-mono">{{ level }}</span></p>
    </template>
  </div>
</template>
