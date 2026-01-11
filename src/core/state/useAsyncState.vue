<template>
  <div>
    <h2>useAsyncState</h2>
    <button @click="execute(1000)" :disabled="isLoading">Execute</button>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else-if="isReady">State: {{ state }}</div>
  </div>
</template>

<script setup>
import { useAsyncState } from "./useAsyncState";

const asyncFunction = (delay) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(`Resolved after ${delay}ms`);
		}, delay);
	});
};

const { state, isLoading, isReady, error, execute } = useAsyncState(
	asyncFunction,
	null,
	{ immediate: false },
);
</script>
