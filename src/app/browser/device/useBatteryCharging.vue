<script setup lang="ts">
import { useBatteryCharging } from './useBatteryCharging'

const { isCharging, chargingTime, dischargingTime } = useBatteryCharging()
</script>

<template>
  <div>
    <h2>Battery Charging Status</h2>
    <div v-if="isCharging !== null">
      <p>Is Charging: {{ isCharging ? 'Yes' : 'No' }}</p>
      <p>Charging Time: {{ chargingTime ? `${chargingTime}s` : 'N/A' }}</p>
      <p>Discharging Time: {{ dischargingTime ? `${dischargingTime}s` : 'N/A' }}</p>
    </div>
    <div v-else>
      <p>Battery API not available</p>
    </div>
  </div>
</template>
