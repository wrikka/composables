<script setup lang="ts">
import { ref } from 'vue'
import { useWebTransport } from './useWebTransport'

const { connect, disconnect, isConnected, isConnecting, error } = useWebTransport()

const url = ref('')

const handleConnect = async () => {
  await connect(url.value)
}

const handleDisconnect = () => {
  disconnect()
}
</script>

<template>
  <div>
    <h2>WebTransport</h2>
    <div>
      <input v-model="url" placeholder="WebTransport URL" />
      <button @click="handleConnect" :disabled="isConnecting">
        {{ isConnecting ? 'Connecting...' : 'Connect' }}
      </button>
      <button @click="handleDisconnect">Disconnect</button>
      <p>Status: {{ isConnected ? 'Connected' : 'Disconnected' }}</p>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
    </div>
  </div>
</template>
