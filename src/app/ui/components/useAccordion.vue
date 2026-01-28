<script setup lang="ts">
import { useAccordion } from "./useAccordion";

const { items, toggle, isOpen } = useAccordion();
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Accordion</h2>
    <div v-for="(item, index) in items" :key="index" class="border rounded">
      <button
        @click="toggle(index)"
        class="w-full p-2 text-left font-medium hover:bg-gray-100"
      >
        {{ item.title }}
      </button>
      <div v-if="isOpen(index)" class="p-2">
        {{ item.content }}
      </div>
    </div>
  </div>
</template>
