<script setup lang="ts">
import { ref } from 'vue'
import { useSpeechSynthesis } from './useSpeechSynthesis'

const text = ref('Hello, this is a test of the speech synthesis API.')
const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis(text)
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Speech Synthesis</h2>
    <p v-if="!isSupported">Speech Synthesis API not supported</p>
    <template v-else>
      <textarea v-model="text" rows="4" class="input w-full"></textarea>
      <div class="flex gap-2">
        <button class="btn" @click="speak" :disabled="isSpeaking">Speak</button>
        <button class="btn" @click="stop" :disabled="!isSpeaking">Stop</button>
      </div>
      <p>Is Speaking: <span class="font-mono">{{ isSpeaking }}</span></p>
    </template>
  </div>
</template>
