<script setup lang="ts">
import { ref } from 'vue'
import { useMediaStream } from './useMediaStream'

const videoRef = ref<HTMLVideoElement | null>(null)

const {
  isSupported,
  stream,
  isActive,
  error,
  start,
  stop,
  getTracks,
  getVideoTracks,
  getAudioTracks,
} = useMediaStream({ video: true, audio: true })

async function handleStart() {
  await start()
  if (stream.value && videoRef.value) {
    videoRef.value.srcObject = stream.value
  }
}
</script>

<template>
  <div class="p-5 border border-gray-300 rounded-lg">
    <h2>Media Stream Demo</h2>
    <div class="my-2.5">
      <p>Supported: {{ isSupported }}</p>
      <p>Active: {{ isActive }}</p>
    </div>
    <div class="flex gap-2.5 my-3.75 flex-wrap">
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="handleStart" :disabled="isActive">Start Stream</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="stop" :disabled="!isActive">Stop Stream</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="getTracks">Get Tracks</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="getVideoTracks">Get Video Tracks</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="getAudioTracks">Get Audio Tracks</button>
    </div>
    <div class="mt-3.75" v-if="isActive">
      <video ref="videoRef" autoplay playsinline class="w-full max-w-[640px] rounded-lg"></video>
    </div>
    <div class="my-2.5 text-red-500" v-if="error">
      <p>Error: {{ error.message }}</p>
    </div>
  </div>
</template>

