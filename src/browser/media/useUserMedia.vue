<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserMedia } from './useUserMedia';

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
    <h2>User Media</h2>
    <video ref="video" autoplay playsinline controls />
    <div class="controls">
      <button @click="start">Start Camera</button>
      <button @click="stop">Stop Camera</button>
    </div>
  </div>
</template>

<style scoped>
video {
  width: 100%;
  max-width: 600px;
  border: 1px solid #ccc;
}
.controls {
  margin-top: 1rem;
}
button {
  margin-right: 0.5rem;
}
</style>
