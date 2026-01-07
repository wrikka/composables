<template>
  <div>
    <h2>useLocalStorage</h2>
    <p>This value will persist in local storage.</p>
    <input v-model="storedValue" type="text" />
    <p>Current value: {{ storedValue }}</p>
    <p>(Try refreshing the page)</p>
  </div>
</template>

<script setup>
import { useLocalStorage } from './useLocalStorage'

const storedValue = useLocalStorage('my-local-storage-key-demo', 'Default Value')
</script>
