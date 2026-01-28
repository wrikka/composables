<script setup lang="ts">
import { useWakeLock } from './useWakeLock'

const { isLocked, error, lock, unlock } = useWakeLock()
</script>

<template>
  <div>
    <h2>Wake Lock</h2>
    <button @click="lock">Lock Screen</button>
    <button @click="unlock">Unlock</button>
    <p>Is Locked: {{ isLocked }}</p>
    <p v-if="error">Error: {{ error.message }}</p>
  </div>
</template>
