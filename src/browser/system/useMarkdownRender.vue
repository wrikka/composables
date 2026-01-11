<template>
  <div>
    <h2>useMarkdownRender</h2>
    <textarea v-model="markdownSource" rows="10" cols="50"></textarea>
    <h3>Rendered HTML:</h3>
    <div v-html="renderedHtml"></div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMarkdownRender } from "../useMarkdownRender";

const markdownSource = ref(
	"# Hello, Markdown!\n\nThis is a demo of `useMarkdownRender`.",
);
const { renderedHtml } = useMarkdownRender(markdownSource);
</script>

<style scoped>
textarea {
  width: 100%;
}
div[v-html] {
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 10px;
}
</style>
