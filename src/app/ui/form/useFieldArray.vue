<script setup lang="ts">
import { useFieldArray } from "./useFieldArray";

const { values, add, remove } = useFieldArray("test");
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Field Array</h2>
    <div v-for="(_, index) in values" :key="index" class="flex gap-2">
      <input v-model="values[index]" type="text" class="p-2 border rounded flex-1" />
      <button @click="remove(index)" class="px-4 py-2 bg-red-500 text-white rounded">Remove</button>
    </div>
    <button @click="add({ value: '' })" class="px-4 py-2 bg-green-500 text-white rounded">Add</button>
  </div>
</template>
