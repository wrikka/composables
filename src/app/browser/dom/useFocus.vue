<script setup lang="ts">
import { useFocus } from "./useFocus";

const { focused } = useFocus();
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Focus</h2>
    <p>Focused: <span class="font-mono">{{ focused }}</span></p>
  </div>
</template>
