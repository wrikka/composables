<script setup lang="ts">
import { useIdle } from './useIdle'

const { isIdle, lastActive } = useIdle({ timeout: 3000 })
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">useIdle</h2>
    <p>Is user idle: <span class="font-mono font-bold" :class="isIdle ? 'text-orange-500' : 'text-green-500'">{{ isIdle }}</span></p>
    <p>Last active time: <span class="font-mono">{{ new Date(lastActive).toLocaleTimeString() }}</span></p>
    <p class="text-sm text-gray-500">(Idle timeout is 3 seconds)</p>
  </div>
</template>
