<script setup lang="ts">
import { ref } from 'vue'
import { useFileHandling } from './useFileHandling'

const { open, save, isOpening, isSaving, error } = useFileHandling()

const content = ref('')
const filename = ref('')
const files = ref<File[]>([])

const handleOpen = async () => {
  files.value = await open()
  if (files.value.length > 0) {
    const file = files.value[0]
    content.value = await file.text()
  }
}

const handleSave = async () => {
  await save(content.value, filename.value)
}
</script>

<template>
  <div>
    <h2>File Handling</h2>
    <div>
      <button @click="handleOpen" :disabled="isOpening">
        {{ isOpening ? 'Opening...' : 'Open File' }}
      </button>
      <input v-model="filename" placeholder="Filename" />
      <button @click="handleSave" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : 'Save File' }}
      </button>
      <textarea v-model="content" placeholder="File content"></textarea>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
      <div v-if="files.length > 0">
        <h3>Selected Files:</h3>
        <ul>
          <li v-for="file in files" :key="file.name">{{ file.name }} ({{ file.size }} bytes)</li>
        </ul>
      </div>
    </div>
  </div>
</template>
