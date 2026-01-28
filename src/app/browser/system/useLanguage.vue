<script setup lang="ts">
import { useLanguage } from "./useLanguage";

const { language } = useLanguage();
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">useLanguage</h2>
    <p>Preferred languages: <span class="font-mono">{{ language }}</span></p>
  </div>
</template>
