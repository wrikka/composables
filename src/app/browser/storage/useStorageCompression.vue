<script setup lang="ts">
import { ref } from 'vue'
import { useStorageCompression } from './useStorageCompression'

const { compress, decompress, isCompressing, isDecompressing, error } = useStorageCompression()

const input = ref('')
const output = ref('')

const handleCompress = async () => {
  try {
    output.value = await compress(input.value)
  } catch (err) {
    console.error(err)
  }
}

const handleDecompress = async () => {
  try {
    output.value = await decompress(input.value)
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div>
    <h2>Storage Compression</h2>
    <div>
      <textarea v-model="input" placeholder="Enter data to compress/decompress"></textarea>
      <button @click="handleCompress" :disabled="isCompressing">
        {{ isCompressing ? 'Compressing...' : 'Compress' }}
      </button>
      <button @click="handleDecompress" :disabled="isDecompressing">
        {{ isDecompressing ? 'Decompressing...' : 'Decompress' }}
      </button>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
      <div v-if="output">
        <h3>Output:</h3>
        <pre>{{ output }}</pre>
      </div>
    </div>
  </div>
</template>
