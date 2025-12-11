<template>
  <div>
    <h2>useSessionStorageState</h2>
    <p>This value will persist in session storage.</p>
    <input v-model="storedValue" type="text" />
    <p>Current value: {{ storedValue }}</p>
    <p>(Try refreshing the page, but not closing the tab/browser)</p>
  </div>
</template>

<script setup>
import { useSessionStorageState } from './useSessionStorageState'

const storedValue = useSessionStorageState('my-session-storage-key', 'Default Value')
</script>
