<template>
  <div>
    <h2>useFilePicker</h2>
    <button @click="open">Open File Picker</button>
    <div v-if="files">
      <h3>Selected Files:</h3>
      <ul>
        <li v-for="(file, index) in files" :key="index">
          {{ file.name }} ({{ file.size }} bytes)
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useFilePicker } from '../useFilePicker'

const { files, open } = useFilePicker({
  multiple: true,
  accept: 'image/*',
})
</script>
