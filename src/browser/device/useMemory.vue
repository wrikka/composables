<script setup lang="ts">
import { useMemory } from "./useMemory";

const { memory } = useMemory();

const _formatBytes = (bytes: number) => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};
</script>

<template>
  <div>
    <h2>Memory Usage</h2>
    <div v-if="memory">
      <p><strong>Used JS Heap Size:</strong> {{ formatBytes(memory.usedJSHeapSize) }}</p>
      <p><strong>Total JS Heap Size:</strong> {{ formatBytes(memory.totalJSHeapSize) }}</p>
      <p><strong>JS Heap Size Limit:</strong> {{ formatBytes(memory.jsHeapSizeLimit) }}</p>
    </div>
    <div v-else>
      <p>Performance Memory API not supported in this browser.</p>
    </div>
  </div>
</template>
