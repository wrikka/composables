<script setup lang="ts">
import { useWebGPU } from './useWebGPU'

const { init, device, isInitializing, error } = useWebGPU()

const handleInit = async () => {
  await init()
}
</script>

<template>
  <div>
    <h2>WebGPU</h2>
    <div>
      <button @click="handleInit" :disabled="isInitializing">
        {{ isInitializing ? 'Initializing...' : 'Initialize' }}
      </button>
      <p v-if="device">WebGPU initialized successfully</p>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
    </div>
  </div>
</template>
