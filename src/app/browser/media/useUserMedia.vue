<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useUserMedia } from "./useUserMedia";

const video = ref<HTMLVideoElement | null>(null);
const { stream, start, stop } = useUserMedia({ video: true });

onMounted(() => {
	if (video.value) {
		video.value.srcObject = stream.value;
	}
});
</script>

<template>
  <div>
    <h2 class="text-xl font-bold">User Media</h2>
    <video ref="video" autoplay playsinline controls class="w-full max-w-[600px] border border-gray-300" />
    <div class="mt-4">
      <button @click="start" class="mr-2">Start Camera</button>
      <button @click="stop">Stop Camera</button>
    </div>
  </div>
</template>

