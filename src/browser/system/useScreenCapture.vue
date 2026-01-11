<template>
  <div>
    <h2>useScreenCapture</h2>
    <p v-if="!isSupported">Screen Capture API not supported</p>
    <template v-else>
      <button @click="startCapture" :disabled="isCapturing">Start Capture</button>
      <button @click="stopCapture" :disabled="!isCapturing">Stop Capture</button>
      <p>Status: {{ isCapturing ? 'Capturing' : 'Idle' }}</p>
      <div v-if="stream">
        <h3>Preview:</h3>
        <video ref="videoRef" autoplay playsinline muted></video>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useScreenCapture } from "../useScreenCapture";

const videoRef = ref(null);
const { isSupported, isCapturing, stream, start, stop } = useScreenCapture();

const _startCapture = async () => {
	await start();
};

const _stopCapture = () => {
	stop();
};

watch(stream, (newStream) => {
	if (newStream && videoRef.value) {
		videoRef.value.srcObject = newStream;
	} else if (videoRef.value) {
		videoRef.value.srcObject = null;
	}
});
</script>
