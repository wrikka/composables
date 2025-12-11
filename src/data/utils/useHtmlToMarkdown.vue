<template>
  <div>
    <h2>useHtmlToMarkdown</h2>
    <textarea v-model="htmlSource" rows="10" cols="50"></textarea>
    <h3>Converted Markdown:</h3>
    <pre>{{ markdown }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useHtmlToMarkdown } from '../useHtmlToMarkdown'

const htmlSource = ref('<h1>Hello</h1><p>This is <strong>HTML</strong>.</p>')
const { markdown } = useHtmlToMarkdown(htmlSource)
</script>

<style scoped>
textarea, pre {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
}
pre {
  background-color: #f5f5f5;
}
</style>
