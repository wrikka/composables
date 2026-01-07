<script setup lang="ts">
import { ref } from 'vue';
import { useClipboard } from './useClipboard';

const { text, read, write, isSupported } = useClipboard();
const inputText = ref('');
</script>

<template>
  <div>
    <h2>useClipboard</h2>
    <div v-if="isSupported">
      <p>Current clipboard text: <code>{{ text || 'empty' }}</code></p>
      <input v-model="inputText" type="text" placeholder="Text to copy" />
      <button @click="write(inputText)">Copy</button>
      <button @click="read">Paste</button>
    </div>
    <div v-else>
      <p>Clipboard API not supported in this browser.</p>
    </div>
  </div>
</template>
