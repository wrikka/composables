<script setup lang="ts">
import { useElementVisibility } from "./useElementVisibility";

const { isVisible } = useElementVisibility();
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Element Visibility</h2>
    <p>Is Visible: <span class="font-mono">{{ isVisible }}</span></p>
  </div>
</template>
