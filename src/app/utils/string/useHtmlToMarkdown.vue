<template>
  <div>
    <h2 class="text-xl font-bold">useHtmlToMarkdown</h2>
    <textarea v-model="htmlSource" rows="10" cols="50" class="w-full box-border p-2.5 border border-gray-300 rounded"></textarea>
    <h3 class="text-lg font-semibold">Converted Markdown:</h3>
    <pre class="w-full box-border p-2.5 bg-gray-50 m-0">{{ markdown }}</pre>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useHtmlToMarkdown } from "../useHtmlToMarkdown";

const htmlSource = ref("<h1>Hello</h1><p>This is <strong>HTML</strong>.</p>");
const { markdown } = useHtmlToMarkdown(htmlSource);
</script>
