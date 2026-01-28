<script setup lang="ts">
import { ref } from 'vue'
import { useHistory } from './useHistory'

const text = ref('')
const { push, undo, redo, canUndo, canRedo, clear, history } = useHistory<string>()

const handleAdd = () => {
  push(text.value)
  text.value = ''
}

const handleUndo = () => {
  undo()
}

const handleRedo = () => {
  redo()
}
</script>

<template>
  <div>
    <h2>History</h2>
    <div>
      <input v-model="text" placeholder="Enter text" />
      <button @click="handleAdd">Add</button>
      <button @click="handleUndo" :disabled="!canUndo">Undo</button>
      <button @click="handleRedo" :disabled="!canRedo">Redo</button>
      <button @click="clear">Clear</button>
    </div>
    <div>
      <h3>History:</h3>
      <ul>
        <li v-for="(item, index) in history" :key="index">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>
