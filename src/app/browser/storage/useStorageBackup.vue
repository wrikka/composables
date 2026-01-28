<script setup lang="ts">
import { ref } from 'vue'
import { useStorageBackup } from './useStorageBackup'

const { backup, restore, isBackingUp, isRestoring, error } = useStorageBackup()

const input = ref('')
const output = ref('')

const handleBackup = async () => {
  try {
    const data = JSON.parse(input.value)
    output.value = await backup(data)
  } catch (err) {
    console.error(err)
  }
}

const handleRestore = async () => {
  try {
    const result = await restore(input.value)
    output.value = JSON.stringify(result, null, 2)
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div>
    <h2>Storage Backup</h2>
    <div>
      <textarea v-model="input" placeholder="Enter JSON data to backup or backup data to restore"></textarea>
      <button @click="handleBackup" :disabled="isBackingUp">
        {{ isBackingUp ? 'Backing up...' : 'Backup' }}
      </button>
      <button @click="handleRestore" :disabled="isRestoring">
        {{ isRestoring ? 'Restoring...' : 'Restore' }}
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
