<script setup lang="ts">
import { useField } from "./useField";

const { value, error, isValid, reset, validateValue } = useField("test", { defaultValue: "" });
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Field</h2>
    <input v-model="value" type="text" class="p-2 border rounded" @blur="validateValue" />
    <p v-if="error" class="text-red-500">{{ error }}</p>
    <p>Is Valid: <span class="font-mono">{{ isValid }}</span></p>
    <button @click="reset" class="px-4 py-2 bg-gray-500 text-white rounded">Reset</button>
  </div>
</template>
