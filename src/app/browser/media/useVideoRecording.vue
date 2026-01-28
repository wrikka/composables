<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useVideoRecording } from "./useVideoRecording";

const _isSupported = computed(() => "MediaRecorder" in window);
const {
	isRecording,
	url,
	previewRef,
	startStream,
	startRecording,
	stopRecording,
	downloadRecording,
} = useVideoRecording();

const _start = async () => {
	await startStream();
	await startRecording();
};

onMounted(() => {
	void previewRef.value;
});
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Video Recording</h2>
    <p v-if="!isSupported">MediaRecorder API not supported</p>
    <template v-else>
      <div class="flex gap-2">
        <button class="btn" @click="start" :disabled="isRecording">Start Recording</button>
        <button class="btn" @click="stopRecording" :disabled="!isRecording">Stop Recording</button>
        <button class="btn" @click="() => downloadRecording()" :disabled="!url">Download</button>
      </div>
      <p>Status: <span class="font-mono">{{ isRecording ? 'Recording' : 'Idle' }}</span></p>
      <div>
        <p class="font-semibold">Live Preview:</p>
        <video ref="previewRef" class="w-full max-w-md border rounded bg-gray-100" muted autoplay playsinline></video>
      </div>
      <div v-if="url">
        <h3 class="font-semibold pt-2">Recorded Preview:</h3>
        <video :src="url" class="w-full max-w-md border rounded" controls></video>
      </div>
    </template>
  </div>
</template>
