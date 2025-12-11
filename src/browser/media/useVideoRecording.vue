<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { useVideoRecording } from './useVideoRecording'

const videoRef: Ref<HTMLVideoElement | null> = ref(null)
const { isSupported, isRecording, start, stop, videoUrl, download } = useVideoRecording()

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
    start(stream)
  } catch (e) {
    console.error('Failed to get media stream:', e)
  }
}

const stopRecording = () => {
  stop()
  if (videoRef.value && videoRef.value.srcObject) {
    const tracks = (videoRef.value.srcObject as MediaStream).getTracks()
    tracks.forEach(track => track.stop())
    videoRef.value.srcObject = null
  }
}
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Video Recording</h2>
    <p v-if="!isSupported">MediaRecorder API not supported</p>
    <template v-else>
      <div class="flex gap-2">
        <button class="btn" @click="startRecording" :disabled="isRecording">Start Recording</button>
        <button class="btn" @click="stopRecording" :disabled="!isRecording">Stop Recording</button>
        <button class="btn" @click="download" :disabled="!videoUrl">Download</button>
      </div>
      <p>Status: <span class="font-mono">{{ isRecording ? 'Recording' : 'Idle' }}</span></p>
      <div>
        <p class="font-semibold">Live Preview:</p>
        <video ref="videoRef" class="w-full max-w-md border rounded bg-gray-100" muted autoplay playsinline></video>
      </div>
      <div v-if="videoUrl">
        <h3 class="font-semibold pt-2">Recorded Preview:</h3>
        <video :src="videoUrl" class="w-full max-w-md border rounded" controls></video>
      </div>
    </template>
  </div>
</template>
