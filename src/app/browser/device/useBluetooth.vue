<script setup lang="ts">
import { useBluetooth } from './useBluetooth'

const {
  isSupported,
  device,
  server,
  isConnected,
  isScanning,
  error,
  requestDevice,
  connect,
  disconnect,
  scan,
} = useBluetooth()
</script>

<template>
  <div class="p-5 border border-gray-300 rounded-lg">
    <h2>Bluetooth Demo</h2>
    <div class="my-2.5">
      <p>Supported: {{ isSupported }}</p>
      <p>Connected: {{ isConnected }}</p>
      <p>Scanning: {{ isScanning }}</p>
    </div>
    <div class="my-2.5" v-if="device">
      <p>Device: {{ device.name }}</p>
      <p>ID: {{ device.id }}</p>
    </div>
    <div class="flex gap-2.5 mt-3.75">
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="requestDevice">Request Device</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="connect" :disabled="!device">Connect</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="disconnect" :disabled="!isConnected">Disconnect</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="scan">Scan</button>
    </div>
    <div class="my-2.5 text-red-500" v-if="error">
      <p>Error: {{ error.message }}</p>
    </div>
  </div>
</template>

