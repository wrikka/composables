<script setup lang="ts">
import { useScreenOrientation } from './useScreenOrientation'

const { isSupported, angle, orientation } = useScreenOrientation()
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Screen Orientation</h2>
    <p v-if="!isSupported">Screen Orientation API not supported</p>
    <template v-else>
      <p>Angle: <span class="font-mono">{{ angle }}</span></p>
      <p>Type: <span class="font-mono">{{ orientation }}</span></p>
    </template>
  </div>
</template>
