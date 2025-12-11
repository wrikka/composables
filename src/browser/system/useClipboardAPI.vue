<script setup lang="ts">
import { ref } from 'vue'
import { useClipboardAPI } from './useClipboardAPI'

const source = ref('Hello from Clipboard API')
const { text, copy, isSupported } = useClipboardAPI()
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">useClipboardAPI</h2>
    <p v-if="!isSupported">Clipboard API not supported</p>
    <template v-else>
      <p>Current clipboard text: <code class="font-mono bg-gray-100 p-1 rounded">{{ text }}</code></p>
      <div class="flex gap-2">
        <input v-model="source" type="text" class="input" />
        <button class="btn" @click="copy(source)">Copy</button>
      </div>
    </template>
  </div>
</template>
