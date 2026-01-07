<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard } from './useClipboard'

const source = ref('Hello')
const { copy, copied, text } = useClipboard()
</script>

<template>
  <div>
    <div class="flex gap-2">
      <input v-model="source" type="text" class="p-2 border rounded-md" />
      <button @click="copy(source)" class="px-4 py-2 bg-blue-500 text-white rounded-md">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <p class="mt-2 text-sm">Current copied text: {{ text }}</p>
  </div>
</template>
