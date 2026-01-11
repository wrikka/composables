<script setup lang="ts">
import { ref } from "vue";
import { useTimeoutFn } from "./useTimeoutFn";

const status = ref("Not started");

const { start, stop } = useTimeoutFn(
	() => {
		status.value = "Fired!";
	},
	2000,
	{ immediate: false },
);

const _startTimer = () => {
	status.value = "Pending...";
	start();
};
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <p>Status: {{ status }}</p>
    <div class="flex gap-2">
      <button class="btn" @click="startTimer">Start Timer (2s)</button>
      <button class="btn" @click="stop">Stop Timer</button>
    </div>
  </div>
</template>
