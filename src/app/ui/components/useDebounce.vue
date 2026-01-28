<script setup lang="ts">
import { useDebounce } from "./useDebounce";

const { debouncedFn, isPending } = useDebounce(() => {
  console.log("Debounced function called");
}, 300);
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Debounce</h2>
    <button
      @click="debouncedFn"
      :disabled="isPending"
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {{ isPending ? "Pending..." : "Click me" }}
    </button>
  </div>
</template>
