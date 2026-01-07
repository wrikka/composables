<script setup lang="ts">
import { useMediaQuery } from './useMediaQuery'

const isLargeScreen = useMediaQuery('(min-width: 1024px)')
const isDark = useMediaQuery('(prefers-color-scheme: dark)')
</script>

<template>
  <div>
    <p>Large screen: {{ isLargeScreen }}</p>
    <p>Dark mode: {{ isDark }}</p>
    <p class="text-sm text-gray-500">Try resizing your window or changing your system theme.</p>
  </div>
</template>
