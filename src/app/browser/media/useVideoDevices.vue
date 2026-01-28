<script setup lang="ts">
import { useVideoDevices } from './useVideoDevices'

const { inputDevices, selectedInputDevice, selectInputDevice } = useVideoDevices()
</script>

<template>
  <div>
    <h2>Video Devices</h2>
    <div>
      <h3>Input Devices</h3>
      <ul>
        <li v-for="device in inputDevices" :key="device.deviceId" @click="selectInputDevice(device)">
          {{ device.label || device.deviceId }} {{ selectedInputDevice?.deviceId === device.deviceId ? '(Selected)' : '' }}
        </li>
      </ul>
    </div>
  </div>
</template>
