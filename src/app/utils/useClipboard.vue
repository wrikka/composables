<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard } from './useClipboard'

const inputText = ref('')
const { copy, paste, text, clear } = useClipboard()

const handleCopy = async () => {
  await copy(inputText.value)
}

const handlePaste = async () => {
  const pasted = await paste()
  if (pasted) {
    inputText.value = pasted
  }
}
</script>

<template>
  <div>
    <h2>Clipboard</h2>
    <div>
      <input v-model="inputText" placeholder="Enter text" />
      <button @click="handleCopy">Copy</button>
      <button @click="handlePaste">Paste</button>
      <button @click="clear">Clear</button>
    </div>
    <div v-if="text">
      <p>Clipboard: {{ text }}</p>
    </div>
  </div>
</template>
