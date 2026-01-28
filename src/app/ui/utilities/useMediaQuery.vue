<script setup lang="ts">
import { useMediaQuery } from "./useMediaQuery";

const _isLargeScreen = useMediaQuery("(min-width: 1024px)");
const _isDark = useMediaQuery("(prefers-color-scheme: dark)");
</script>

<template>
  <div>
    <p>Large screen: {{ _isLargeScreen }}</p>
    <p>Dark mode: {{ _isDark }}</p>
    <p class="text-sm text-gray-500">Try resizing your window or changing your system theme.</p>
  </div>
</template>
