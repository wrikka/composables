<script setup lang="ts">
import { ref } from 'vue'
import { useAudioRecording } from './useAudioRecording'

const {
  isSupported,
  isRecording,
  stream,
  chunks,
  error,
  start,
  stop,
  pause,
  resume,
} = useAudioRecording()

const audioUrl = ref('')
</script>

<template>
  <div class="p-5 border border-gray-300 rounded-lg">
    <h2>Audio Recording Demo</h2>
    <div class="my-2.5">
      <p>Supported: {{ isSupported }}</p>
      <p>Recording: {{ isRecording }}</p>
      <p>Chunks: {{ chunks.length }}</p>
    </div>
    <div class="flex gap-2.5 my-3.75">
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="start" :disabled="isRecording">Start Recording</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="stop" :disabled="!isRecording">Stop Recording</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="pause" :disabled="!isRecording">Pause</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="resume" :disabled="!isRecording">Resume</button>
    </div>
    <div class="mt-3.75" v-if="audioUrl">
      <audio :src="audioUrl" controls></audio>
    </div>
    <div class="my-2.5 text-red-500" v-if="error">
      <p>Error: {{ error.message }}</p>
    </div>
  </div>
</template>

