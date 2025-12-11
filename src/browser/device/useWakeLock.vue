<script setup lang="ts">
import { useWakeLock } from './useWakeLock'

const { isSupported, isActive, requestWakeLock, releaseWakeLock } = useWakeLock()
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Wake Lock</h2>
    <p v-if="!isSupported">Wake Lock API not supported</p>
    <template v-else>
      <p>Wake Lock is active: <span class="font-mono font-bold" :class="isActive ? 'text-green-500' : 'text-red-500'">{{ isActive }}</span></p>
      <div class="flex gap-2">
        <button class="btn" @click="requestWakeLock">Request Wake Lock</button>
        <button class="btn" @click="releaseWakeLock">Release Wake Lock</button>
      </div>
    </template>
  </div>
</template>
