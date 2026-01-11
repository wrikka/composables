<script setup lang="ts">
import { ref } from "vue";
import { useFocus } from "./useFocus";

const inputEl = ref<HTMLInputElement | null>(null);
const { isFocused } = useFocus(inputEl);
</script>

<template>
  <div>
    <input ref="inputEl" type="text" placeholder="Focus me" class="p-2 border rounded-md" />
    <p class="mt-2">Is focused: {{ isFocused }}</p>
  </div>
</template>
