<script setup lang="ts">
import { ref } from 'vue'
import { useFullscreen } from './useFullscreen'

const el = ref<HTMLElement | null>(null)
const { isFullscreen, enter, exit, toggle } = useFullscreen(el)
</script>

<template>
  <div>
    <div ref="el" class="p-4 bg-gray-200 rounded-md">
      <p>Fullscreen element</p>
      <p>Is fullscreen: {{ isFullscreen }}</p>
    </div>
    <div class="flex gap-2 mt-2">
      <button @click="enter" class="px-4 py-2 bg-blue-500 text-white rounded-md">Enter</button>
      <button @click="exit" class="px-4 py-2 bg-red-500 text-white rounded-md">Exit</button>
      <button @click="toggle" class="px-4 py-2 bg-green-500 text-white rounded-md">Toggle</button>
    </div>
  </div>
</template>
