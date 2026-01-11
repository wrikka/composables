<script setup lang="ts">
import { ref } from "vue";
import { useDebounce } from "./useDebounce";

const text = ref("");
const { debouncedValue } = useDebounce(text, () => {}, { delay: 500 });
</script>

<template>
  <div>
    <input v-model="text" type="text" placeholder="Type something..." class="p-2 border rounded-md" />
    <p class="mt-2">Debounced value: {{ debouncedValue }}</p>
  </div>
</template>
