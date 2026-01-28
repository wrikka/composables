<script setup lang="ts">
import { ref } from 'vue'
import { useElementBounding } from "./useElementBounding";

const elementRef = ref<HTMLElement | null>(null)
const { x, y, width, height, update } = useElementBounding(elementRef);
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Element Bounding</h2>
    <p>X: <span class="font-mono">{{ x }}</span></p>
    <p>Y: <span class="font-mono">{{ y }}</span></p>
    <p>Width: <span class="font-mono">{{ width }}</span></p>
    <p>Height: <span class="font-mono">{{ height }}</span></p>
    <button @click="update" class="px-4 py-2 bg-blue-500 text-white rounded">Update</button>
  </div>
</template>
