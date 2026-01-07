<script setup lang="ts">
import { ref } from 'vue'
import { useIntervalFn } from './useIntervalFn'

const count = ref(0)

const { pause, resume } = useIntervalFn(() => {
  count.value++
}, 1000)
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <p>Count: {{ count }}</p>
    <div class="flex gap-2">
      <button class="btn" @click="pause">Pause</button>
      <button class="btn" @click="resume">Resume</button>
    </div>
  </div>
</template>
