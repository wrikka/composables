<script setup lang="ts">
import { useTitle } from "./useTitle";

const { title } = useTitle("My Awesome Page");
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">useTitle</h2>
    <p>Current document title: <span class="font-mono">{{ title }}</span></p>
    <input v-model="title" type="text" class="input w-full max-w-sm" placeholder="Enter new title" />
  </div>
</template>
