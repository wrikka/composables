<template>
  <div>
    <h2 class="text-xl font-bold">useMarkdownRender</h2>
    <textarea v-model="markdownSource" rows="10" cols="50" class="w-full" />
    <h3 class="text-lg font-semibold mt-4">Rendered HTML:</h3>
    <div v-html="renderedHtml" class="border border-gray-300 p-2.5 mt-2.5" />
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
