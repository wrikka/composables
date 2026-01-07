<script setup lang="ts">
import { useLocalStorage } from './useLocalStorage'

const name = useLocalStorage('name', 'Anonymous')
</script>

<template>
  <div>
    <input v-model="name" type="text" placeholder="Enter your name" class="p-2 border rounded-md" />
    <p class="mt-2">Hello, {{ name }}!</p>
    <p class="text-sm text-gray-500">Try refreshing the page.</p>
  </div>
</template>
