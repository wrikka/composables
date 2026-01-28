<script setup lang="ts">
import { useQRCode } from "./useQRCode";

const { qrCode, generate } = useQRCode();
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">QR Code</h2>
    <input
      v-model="qrCode"
      @input="generate"
      type="text"
      placeholder="Enter text to generate QR code"
      class="w-full p-2 border rounded"
    />
    <div class="p-4 border rounded bg-gray-50 flex justify-center">
      <div v-html="qrCode" />
    </div>
  </div>
</template>
