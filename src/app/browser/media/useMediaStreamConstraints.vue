<script setup lang="ts">
import { useMediaStreamConstraints } from './useMediaStreamConstraints'

const { 
  constraints, 
  audioEnabled, 
  videoEnabled, 
  audioDeviceId, 
  videoDeviceId, 
  width, 
  height, 
  frameRate,
  toggleAudio,
  toggleVideo,
  setAudioDevice,
  setVideoDevice,
  setResolution,
  setFrameRate,
} = useMediaStreamConstraints()
</script>

<template>
  <div>
    <h2>Media Stream Constraints</h2>
    <div>
      <p>Audio Enabled: {{ audioEnabled }}</p>
      <p>Video Enabled: {{ videoEnabled }}</p>
      <p>Audio Device: {{ audioDeviceId || 'Default' }}</p>
      <p>Video Device: {{ videoDeviceId || 'Default' }}</p>
      <p>Resolution: {{ width }}x{{ height }}</p>
      <p>Frame Rate: {{ frameRate }} fps</p>
      <button @click="toggleAudio">Toggle Audio</button>
      <button @click="toggleVideo">Toggle Video</button>
    </div>
  </div>
</template>
