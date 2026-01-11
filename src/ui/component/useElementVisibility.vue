<script setup lang="ts">
import { ref } from "vue";
import { useElementVisibility } from "./useElementVisibility";

const el = ref<HTMLElement | null>(null);
const _isVisible = useElementVisibility(el);
</script>

<template>
  <div class="h-64 overflow-y-scroll border rounded-md p-4">
    <div class="h-96">Scroll down</div>
    <div ref="el" class="p-4 bg-green-200 rounded-md">
      <p>Element to watch</p>
    </div>
    <div class="h-96"></div>
    <div class="fixed top-4 right-4 p-2 bg-white border rounded-md shadow-md">
      Is element visible: {{ isVisible }}
    </div>
  </div>
</template>
