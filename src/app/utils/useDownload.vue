<script setup lang="ts">
import { ref } from 'vue'
import { useDownload } from './useDownload'

const content = ref('Hello, World!')
const filename = ref('test.txt')
const { download, isDownloading, error } = useDownload()

const handleDownload = async () => {
  await download(content.value, { filename: filename.value })
}
</script>

<template>
  <div>
    <h2>Download</h2>
    <div>
      <textarea v-model="content" placeholder="Content to download"></textarea>
      <input v-model="filename" placeholder="Filename" />
      <button @click="handleDownload" :disabled="isDownloading">
        {{ isDownloading ? 'Downloading...' : 'Download' }}
      </button>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
    </div>
  </div>
</template>
