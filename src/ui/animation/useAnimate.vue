<script setup lang="ts">
import { ref } from 'vue'
import { useAnimate } from './useAnimate'

const el = ref<HTMLElement | null>(null)

const keyframes = ref([
  { transform: 'translateX(0px) rotate(0deg)', opacity: 1 },
  { transform: 'translateX(100px) rotate(30deg)', opacity: 0.8 },
  { transform: 'translateX(200px) rotate(0deg)', opacity: 1 },
])

const { play, pause, isPlaying } = useAnimate(el, keyframes, {
  duration: 2000,
  iterations: Infinity,
  direction: 'alternate',
  easing: 'ease-in-out',
})
</script>

<template>
  <div>
    <div ref="el" style="width: 50px; height: 50px; background-color: #42b883"></div>
    <button @click="isPlaying ? pause() : play()">
      {{ isPlaying ? 'Pause' : 'Play' }}
    </button>
  </div>
</template>
