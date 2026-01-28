<template>
  <div>
    <h2>useImageUpload</h2>
    <input type="file" accept="image/*" @change="onFileChange" />
    <div v-if="isLoading">Uploading...</div>
    <div v-if="error">Error: {{ error.message }}</div>
    <div v-if="imageUrl">
      <h3>Uploaded Image:</h3>
      <img :src="imageUrl" alt="Uploaded Image" style="max-width: 300px;" />
    </div>
  </div>
</template>

<script setup>
import { useImageUpload } from "../useImageUpload";

// This is a mock upload function for demonstration purposes.
// In a real application, this would be an API call to your server.
const mockUpload = async (file) => {
	console.log(`Uploading ${file.name}...`);
	// Simulate a delay
	await new Promise((resolve) => setTimeout(resolve, 1500));
	// Simulate a successful upload by returning a blob URL
	return URL.createObjectURL(file);
};

const { imageUrl, isLoading, error, upload } = useImageUpload({
	uploadFunction: mockUpload,
});

const _onFileChange = (event) => {
	const file = event.target.files[0];
	if (file) {
		upload(file);
	}
};
</script>
