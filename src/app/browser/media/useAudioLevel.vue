<script setup lang="ts">
import { useAudioLevel } from './useAudioLevel'

const { inputLevel, outputLevel, isMonitoring } = useAudioLevel()
</script>

<template>
  <div>
    <h2>Audio Level</h2>
    <div v-if="isMonitoring">
      <p>Input Level: {{ (inputLevel! * 100).toFixed(0) }}%</p>
      <p>Output Level: {{ (outputLevel! * 100).toFixed(0) }}%</p>
    </div>
    <div v-else>
      <p>Not monitoring audio level</p>
    </div>
  </div>
</template>
