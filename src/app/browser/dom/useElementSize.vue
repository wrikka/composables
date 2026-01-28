<script setup lang="ts">
import { useElementSize } from "./useElementSize";

const { width, height } = useElementSize();
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Element Size</h2>
    <p>Width: <span class="font-mono">{{ width }}</span></p>
    <p>Height: <span class="font-mono">{{ height }}</span></p>
  </div>
</template>
