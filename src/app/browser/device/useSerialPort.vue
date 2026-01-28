<script setup lang="ts">
import { ref } from 'vue'
import { useSerialPort } from './useSerialPort'

const {
  isSupported,
  port,
  isOpen,
  error,
  requestPort,
  open,
  close,
  write,
  read,
  getPorts,
} = useSerialPort()

const inputData = ref('')
const outputData = ref('')

async function handleWrite() {
  const data = new TextEncoder().encode(inputData.value)
  await write(data)
  inputData.value = ''
}

async function handleRead() {
  const data = await read()
  if (data) {
    outputData.value = new TextDecoder().decode(data)
  }
}
</script>

<template>
  <div class="p-5 border border-gray-300 rounded-lg">
    <h2>Serial Port Demo</h2>
    <div class="my-2.5">
      <p>Supported: {{ isSupported }}</p>
      <p>Open: {{ isOpen }}</p>
    </div>
    <div class="flex gap-2.5 my-3.75">
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="requestPort">Request Port</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="open" :disabled="!port">Open</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="close" :disabled="!isOpen">Close</button>
      <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="getPorts">Get Ports</button>
    </div>
    <div class="mt-3.75" v-if="isOpen">
      <div class="my-2.5">
        <input class="p-2 mr-2.5" v-model="inputData" placeholder="Enter data to write" />
        <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="handleWrite">Write</button>
      </div>
      <div class="my-2.5">
        <button class="px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" @click="handleRead">Read</button>
        <p>Output: {{ outputData }}</p>
      </div>
    </div>
    <div class="my-2.5 text-red-500" v-if="error">
      <p>Error: {{ error.message }}</p>
    </div>
  </div>
</template>

