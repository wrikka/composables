<script setup lang="ts">
import { usePageVisibility } from './usePageVisibility'

const visibility = usePageVisibility()
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">usePageVisibility</h2>
    <p>Page is visible: <span class="font-mono font-bold" :class="visibility === 'visible' ? 'text-green-500' : 'text-orange-500'">{{ visibility }}</span></p>
    <p class="text-sm text-gray-500">(Try switching browser tabs)</p>
  </div>
</template>
