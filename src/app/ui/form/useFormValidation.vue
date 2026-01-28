<script setup lang="ts">
import { useFormValidation } from "./useFormValidation";

const { errors, validateAll, reset, isValid } = useFormValidation(
  { name: "", email: "" },
  {
    name: [],
    email: []
  }
);
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Form Validation</h2>
    <p>Is Valid: <span class="font-mono">{{ isValid }}</span></p>
    <button @click="validateAll" class="px-4 py-2 bg-blue-500 text-white rounded">Validate</button>
    <button @click="reset" class="px-4 py-2 bg-gray-500 text-white rounded">Reset</button>
    <div v-if="Object.keys(errors).length > 0" class="text-red-500">
      <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
    </div>
  </div>
</template>
