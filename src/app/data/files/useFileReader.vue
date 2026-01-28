<template>
  <div>
    <h2 class="text-xl font-bold">useFileReader</h2>
    <input type="file" @change="onFileChange" class="border border-gray-300 rounded px-2.5 py-2" />
    <div v-if="isLoading" class="mt-4">Loading...</div>
    <div v-if="error" class="mt-4 text-red-600">Error: {{ error.message }}</div>
    <div v-if="result">
      <h3 class="text-lg font-semibold mt-4">File Content (as Text):</h3>
      <pre class="bg-gray-50 p-2.5 m-0">{{ textResult }}</pre>
      <h3 class="text-lg font-semibold mt-4">File Content (as Data URL):</h3>
      <p class="break-words">{{ dataUrlResult }}</p>
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
