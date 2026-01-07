<script setup lang="ts">
import { useSpeechRecognition } from './useSpeechRecognition'

const { isSupported, isListening, transcript: result, start, stop } = useSpeechRecognition()
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Speech Recognition</h2>
    <p v-if="!isSupported">Speech Recognition API not supported</p>
    <template v-else>
      <div class="flex gap-2">
        <button class="btn" @click="start" :disabled="isListening">Start Listening</button>
        <button class="btn" @click="stop" :disabled="!isListening">Stop Listening</button>
      </div>
      <p>Is Listening: <span class="font-mono">{{ isListening }}</span></p>
      <p>Result: <span class="font-mono">{{ result }}</span></p>
    </template>
  </div>
</template>
