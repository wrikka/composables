<script setup lang="ts">
import { useFormDirty } from "./useFormDirty";

const { isDirty, markAsDirty, markAsClean } = useFormDirty({ name: "", email: "" });
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Form Dirty</h2>
    <p>Is Dirty: <span class="font-mono">{{ isDirty }}</span></p>
    <button @click="markAsDirty" class="px-4 py-2 bg-blue-500 text-white rounded">Mark Dirty</button>
    <button @click="markAsClean" class="px-4 py-2 bg-gray-500 text-white rounded">Mark Clean</button>
  </div>
</template>
