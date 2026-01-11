<script setup lang="ts">
import { computed, ref } from "vue";
import { useWebSocket } from "./useWebSocket";

const _message = ref("");
const { isConnected, isConnecting, messageHistory, send } = useWebSocket({
	url: "wss://echo.websocket.org",
});

const _status = computed(() => {
	if (isConnecting.value) return "CONNECTING";
	return isConnected.value ? "OPEN" : "CLOSED";
});
const _history = messageHistory;
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">WebSocket</h2>
    <p>Status: <span class="font-mono" :class="{ 'text-green-500': status === 'OPEN', 'text-red-500': status === 'CLOSED' }">{{ status }}</span></p>
    <div class="flex gap-2">
      <input v-model="message" type="text" class="input" placeholder="Message to send" />
      <button class="btn" @click="send(message)" :disabled="status !== 'OPEN'">Send</button>
    </div>
    <h3 class="font-semibold pt-2">Received messages:</h3>
    <ul class="list-disc list-inside h-40 overflow-y-auto bg-gray-100 p-2 rounded">
      <li v-for="(msg, index) in history" :key="index" class="font-mono text-sm">{{ msg.data }}</li>
    </ul>
  </div>
</template>
