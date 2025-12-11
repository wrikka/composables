<script setup lang="ts">
import { useGeolocation } from './useGeolocation'

const { isSupported, position, error, getCurrentPosition, startWatching, stopWatching } = useGeolocation({ watchPosition: true })
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Geolocation</h2>
    <p v-if="!isSupported">Geolocation API not supported</p>
    <template v-else>
      <div class="flex gap-2">
        <button class="btn" @click="getCurrentPosition">Get Current Position</button>
        <button class="btn" @click="startWatching">Start Watching</button>
        <button class="btn" @click="stopWatching">Stop Watching</button>
      </div>
      <div v-if="position" class="font-mono text-sm space-y-1">
        <p>Coords: {{ position.latitude }}, {{ position.longitude }}</p>
        <p>Altitude: {{ position.altitude }}</p>
        <p>Heading: {{ position.heading }}</p>
        <p>Speed: {{ position.speed }}</p>
      </div>
      <div v-if="error" class="p-2 bg-red-100 text-red-700 rounded">
        <p>Error: {{ error }}</p>
      </div>
    </template>
  </div>
</template>
