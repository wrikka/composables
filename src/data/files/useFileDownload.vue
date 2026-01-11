<template>
  <div>
    <h2>useFileDownload</h2>
    <button @click="startDownload" :disabled="isDownloading">
      {{ isDownloading ? 'Downloading...' : 'Download Sample Text File' }}
    </button>
    <p v-if="error">Error: {{ error.message }}</p>
  </div>
</template>

<script setup>
import { useFileDownload } from "../useFileDownload";

const { isDownloading, error, download } = useFileDownload();

const _startDownload = () => {
	// Using a blob URL as a sample file source
	const sampleContent = "Hello, this is a sample file for download.";
	const blob = new Blob([sampleContent], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	download(url, { fileName: "sample.txt" });
};
</script>
