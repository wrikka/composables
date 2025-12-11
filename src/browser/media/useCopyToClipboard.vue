<script setup lang="ts">
import { ref } from 'vue'
import { useCopyToClipboard } from './useCopyToClipboard'

const source = ref('Hello')
const { copy, copied, isSupported } = useCopyToClipboard()
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Copy to Clipboard</h2>
    <p v-if="!isSupported">Clipboard API not supported</p>
    <template v-else>
      <div class="flex gap-2 items-center">
        <input v-model="source" type="text" class="input" />
        <button class="btn" @click="copy(source)">Copy</button>
        <p v-if="copied" class="text-green-500">Copied!</p>
      </div>
    </template>
  </div>
</template>
