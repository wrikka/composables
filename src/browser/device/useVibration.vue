<script setup lang="ts">
import { useVibration } from "./useVibration";

const { isSupported, vibrate, stopVibration } = useVibration();

const _startVibration = () => {
	vibrate(200);
};
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Vibration</h2>
    <p v-if="!isSupported">Vibration API not supported</p>
    <template v-else>
      <div class="flex gap-2">
        <button class="btn" @click="startVibration">Vibrate for 200ms</button>
        <button class="btn" @click="stopVibration">Stop Vibration</button>
      </div>
      <p class="text-sm text-gray-500">Note: There is no 'isVibrating' state available in the Web Vibration API.</p>
    </template>
  </div>
</template>
