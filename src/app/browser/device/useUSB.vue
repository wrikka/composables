<script setup lang="ts">
import { useUSB } from './useUSB'

const {
  isSupported,
  device,
  isConnected,
  error,
  requestDevice,
  connect,
  disconnect,
  getDevices,
} = useUSB()
</script>

<template>
  <div class="p-5 border border-gray-300 rounded-lg">
    <h2>USB Demo</h2>
    <div class="my-2.5">
      <p>Supported: {{ isSupported }}</p>
      <p>Connected: {{ isConnected }}</p>
    </div>
    <div class="my-2.5" v-if="device">
      <p>Product: {{ device.productName }}</p>
      <p>Manufacturer: {{ device.manufacturerName }}</p>
      <p>Vendor ID: {{ device.vendorId }}</p>
      <p>Product ID: {{ device.productId }}</p>
    </div>
    <div class="flex gap-2.5 mt-3.75">
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="requestDevice">Request Device</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="connect" :disabled="!device">Connect</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="disconnect" :disabled="!isConnected">Disconnect</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="getDevices">Get Devices</button>
    </div>
    <div class="my-2.5 text-red-500" v-if="error">
      <p>Error: {{ error.message }}</p>
    </div>
  </div>
</template>

