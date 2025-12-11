<script setup lang="ts">
import { useDeviceOrientation } from './useDeviceOrientation'

const { isSupported, orientation, error, requestPermission } = useDeviceOrientation()
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">useDeviceOrientation</h2>
    <button class="btn" @click="requestPermission">Request Permission</button>
    <p v-if="!isSupported">Device Orientation API not supported</p>
    <p v-if="error" class="text-red-500">Error: {{ error }}</p>
    <template v-else>
      <div class="font-mono text-sm space-y-1 bg-gray-100 p-2 rounded mt-2">
        <p>Alpha: {{ orientation.alpha?.toFixed(2) }}</p>
        <p>Beta: {{ orientation.beta?.toFixed(2) }}</p>
        <p>Gamma: {{ orientation.gamma?.toFixed(2) }}</p>
      </div>
    </template>
  </div>
</template>
