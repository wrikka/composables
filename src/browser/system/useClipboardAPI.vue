<script setup lang="ts">
import { ref } from "vue";
import { useClipboardAPI } from "./useClipboardAPI";

const _source = ref("Hello from Clipboard API");
const pasted = ref<string | null>(null);
const { copy, paste, isSupported } = useClipboardAPI();

async function _handlePaste() {
	pasted.value = await paste();
}
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">useClipboardAPI</h2>
    <p v-if="!isSupported">Clipboard API not supported</p>
    <template v-else>
      <p>Clipboard text: <code class="font-mono bg-gray-100 p-1 rounded">{{ pasted }}</code></p>
      <div class="flex gap-2">
        <input v-model="source" type="text" class="input" />
        <button class="btn" @click="copy(source)">Copy</button>
        <button class="btn" @click="handlePaste">Paste</button>
      </div>
    </template>
  </div>
</template>
