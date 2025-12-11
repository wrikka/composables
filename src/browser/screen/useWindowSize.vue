<script setup lang="ts">
import { useWindowSize } from './useWindowSize'

const { width, height } = useWindowSize()
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">useWindowSize</h2>
    <p>Window width: <span class="font-mono">{{ width }}</span></p>
    <p>Window height: <span class="font-mono">{{ height }}</span></p>
  </div>
</template>
