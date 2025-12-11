<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import { useMediaDevices } from './useMediaDevices'

const videoRef: Ref<HTMLVideoElement | null> = ref(null)
const stream = ref<MediaStream | null>(null)
const { isSupported, devices, getStream, requestPermissions } = useMediaDevices()

const startStream = async () => {
  const mediaStream = await getStream()
  if (mediaStream) {
    stream.value = mediaStream
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
    }
  }
}

const stopStream = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

// Request permissions on mount to get device labels
onMounted(async () => {
  await requestPermissions()
})
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Media Devices</h2>
    <p v-if="!isSupported">MediaDevices API not supported</p>
    <template v-else>
      <div class="flex gap-2">
        <button class="btn" @click="startStream">Start Camera</button>
        <button class="btn" @click="stopStream">Stop Camera</button>
      </div>
      <div v-if="stream">
        <video ref="videoRef" autoplay playsinline class="border rounded w-full max-w-md"></video>
      </div>
      <h3 class="font-semibold pt-2">Available Devices:</h3>
      <ul class="list-disc list-inside">
        <li v-for="device in devices" :key="device.deviceId" class="font-mono text-sm">
          {{ device.kind }}: {{ device.label || 'Label not available' }}
        </li>
      </ul>
    </template>
  </div>
</template>
