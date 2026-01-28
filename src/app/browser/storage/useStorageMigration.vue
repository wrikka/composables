<script setup lang="ts">
import { ref } from 'vue'
import { useStorageMigration } from './useStorageMigration'

const { migrate, isMigrating, error } = useStorageMigration()

const input = ref('')
const fromVersion = ref('1.0')
const toVersion = ref('1.1')
const output = ref('')

const handleMigrate = async () => {
  try {
    const data = JSON.parse(input.value)
    const result = await migrate(data, fromVersion.value, toVersion.value)
    output.value = JSON.stringify(result, null, 2)
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div>
    <h2>Storage Migration</h2>
    <div>
      <input v-model="fromVersion" placeholder="From version" />
      <input v-model="toVersion" placeholder="To version" />
      <textarea v-model="input" placeholder="Enter JSON data to migrate"></textarea>
      <button @click="handleMigrate" :disabled="isMigrating">
        {{ isMigrating ? 'Migrating...' : 'Migrate' }}
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
