<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTimeline, type TimelineSegment } from './useTimeline'

const el1 = ref<HTMLElement | null>(null)
const el2 = ref<HTMLElement | null>(null)
const el3 = ref<HTMLElement | null>(null)

const segments = ref<TimelineSegment[]>([])

const { currentTime, duration, play, pause, seek, isPlaying } = useTimeline(segments)

onMounted(() => {
  if (!el1.value || !el2.value || !el3.value) return

  segments.value = [
    {
      animation: el1.value.animate([{ transform: 'scale(0.5)' }, { transform: 'scale(1)' }], { duration: 1000, fill: 'both' }),
      start: 0,
      end: 1000,
    },
    {
      animation: el2.value.animate([{ transform: 'translateX(0px)' }, { transform: 'translateX(100px)' }], { duration: 1000, fill: 'both' }),
      start: 500,
      end: 1500,
    },
    {
      animation: el3.value.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'both' }),
      start: 1500,
      end: 2000,
    },
  ]
  
  // Pause all animations initially, timeline will control them
  segments.value.forEach(s => s.animation.pause())
})
</script>

<template>
  <div>
    <div class="container">
      <div ref="el1" class="box"></div>
      <div ref="el2" class="box"></div>
      <div ref="el3" class="box"></div>
    </div>
    <div class="controls">
      <button @click="isPlaying ? pause() : play()">{{ isPlaying ? 'Pause' : 'Play' }}</button>
      <input
        type="range"
        :min="0"
        :max="duration"
        :value="currentTime"
        @input="(e) => seek(Number((e.target as HTMLInputElement).value))"
      />
      <span>{{ (currentTime / 1000).toFixed(2) }}s / {{ (duration / 1000).toFixed(2) }}s</span>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.box {
  width: 50px;
  height: 50px;
  background-color: #42b883;
}
.controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
