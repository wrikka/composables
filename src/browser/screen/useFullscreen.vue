<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { useFullscreen } from './useFullscreen'

const elementToFullscreen: Ref<HTMLElement | null> = ref(null)
const { isSupported, isFullscreen, enter, exit, toggle } = useFullscreen(elementToFullscreen)
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">useFullscreen</h2>
    <p v-if="!isSupported">Fullscreen API not supported</p>
    <template v-else>
      <div ref="elementToFullscreen" class="p-4 bg-gray-100 border rounded space-y-2">
        <p>This is the element that will go fullscreen.</p>
        <p>Is fullscreen: <span class="font-mono font-bold" :class="isFullscreen ? 'text-green-500' : 'text-red-500'">{{ isFullscreen }}</span></p>
        <div class="flex gap-2">
          <button class="btn" @click="toggle">Toggle Fullscreen</button>
          <button class="btn" @click="enter">Enter Fullscreen</button>
          <button class="btn" @click="exit">Exit Fullscreen</button>
        </div>
      </div>
    </template>
  </div>
</template>
