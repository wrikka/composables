<script setup lang="ts">
import { usePreferredDark } from "./usePreferredDark";

const { isDark, isSupported } = usePreferredDark();
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">usePreferredDark</h2>
    <p v-if="!isSupported">prefers-color-scheme not supported</p>
    <template v-else>
      <p>Is dark mode preferred: <span class="font-mono font-bold" :class="isDark ? 'text-white bg-black' : 'text-black bg-white p-1 rounded'">{{ isDark }}</span></p>
      <p class="text-sm text-gray-500">(Try changing your OS/browser theme)</p>
    </template>
  </div>
</template>
