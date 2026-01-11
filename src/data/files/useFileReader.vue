<template>
  <div>
    <h2>useFileReader</h2>
    <input type="file" @change="onFileChange" />
    <div v-if="isLoading">Loading...</div>
    <div v-if="error">Error: {{ error.message }}</div>
    <div v-if="result">
      <h3>File Content (as Text):</h3>
      <pre>{{ textResult }}</pre>
      <h3>File Content (as Data URL):</h3>
      <p style="overflow-wrap: break-word;">{{ dataUrlResult }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useFileReader } from "../useFileReader";

const { result, isLoading, error, read } = useFileReader();
const textResult = ref("");
const dataUrlResult = ref("");

const _onFileChange = (event) => {
	const file = event.target.files[0];
	if (!file) return;

	// Read as text
	read(file, "text");
	// Since read is async, we can't get the result immediately.
	// A real app would use a watcher or computed property.
	// For this demo, we'll read it twice.
	const readerText = new FileReader();
	readerText.onload = (e) => {
		textResult.value = e.target.result;
	};
	readerText.readAsText(file);

	const readerDataUrl = new FileReader();
	readerDataUrl.onload = (e) => {
		dataUrlResult.value = e.target.result;
	};
	readerDataUrl.readAsDataURL(file);
};
</script>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 10px;
}
</style>
