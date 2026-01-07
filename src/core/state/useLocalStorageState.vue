<template>
  <div>
    <h2>useLocalStorageState</h2>
    <p>This value will persist in local storage.</p>
    <input v-model="storedValue" type="text" />
    <p>Current value: {{ storedValue }}</p>
    <p>(Try refreshing the page)</p>
  </div>
</template>

<script setup>
import { useLocalStorageState } from './useLocalStorageState'

const storedValue = useLocalStorageState('my-local-storage-key', 'Default Value')
</script>
