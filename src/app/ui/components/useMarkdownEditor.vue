<script setup lang="ts">
import { useMarkdownEditor } from "./useMarkdownEditor";

const { content, html, updateContent } = useMarkdownEditor();
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Markdown Editor</h2>
    <textarea
      v-model="content"
      @input="updateContent"
      class="w-full h-32 p-2 border rounded"
      placeholder="Write markdown here..."
    />
    <div class="p-2 border rounded bg-gray-50">
      <h3 class="font-bold mb-2">Preview:</h3>
      <div v-html="html" />
    </div>
  </div>
</template>
