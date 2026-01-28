<script setup lang="ts">
import { useDeviceMemory } from './useDeviceMemory'

const { memory, jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = useDeviceMemory()
</script>

<template>
  <div>
    <h2>Device Memory</h2>
    <div v-if="memory !== null">
      <p>Device Memory: {{ memory }} GB</p>
      <p>JS Heap Size Limit: {{ (jsHeapSizeLimit / 1024 / 1024).toFixed(2) }} MB</p>
      <p>Total JS Heap Size: {{ (totalJSHeapSize / 1024 / 1024).toFixed(2) }} MB</p>
      <p>Used JS Heap Size: {{ (usedJSHeapSize / 1024 / 1024).toFixed(2) }} MB</p>
    </div>
    <div v-else>
      <p>Memory API not available</p>
    </div>
  </div>
</template>
