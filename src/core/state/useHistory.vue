<template>
  <div>
    <h2>useHistory</h2>
    <p>Current Value: {{ value }}</p>
    <input v-model="value" type="text" />
    <button @click="undo" :disabled="!canUndo">Undo</button>
    <button @click="redo" :disabled="!canRedo">Redo</button>
    <button @click="clear">Clear History</button>
    <h3>History:</h3>
    <pre>{{ history }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useHistory } from './useHistory'

const value = ref('')
const { history, canUndo, canRedo, undo, redo, clear } = useHistory(value)
</script>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 10px;
  max-height: 150px;
  overflow-y: auto;
}
</style>
