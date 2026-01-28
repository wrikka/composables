<script setup lang="ts">
import { useUpload } from './useUpload'

const { upload, isUploading, files, clear } = useUpload()

const handleUpload = async () => {
  await upload({ multiple: true })
}
</script>

<template>
  <div>
    <h2>Upload</h2>
    <div>
      <button @click="handleUpload" :disabled="isUploading">
        {{ isUploading ? 'Uploading...' : 'Upload Files' }}
      </button>
      <button @click="clear">Clear</button>
    </div>
    <div v-if="files.length > 0">
      <h3>Uploaded Files:</h3>
      <ul>
        <li v-for="file in files" :key="file.name">
          {{ file.name }} ({{ file.size }} bytes)
        </li>
      </ul>
    </div>
  </div>
</template>
