<script setup lang="ts">
import { useAudioDevices } from './useAudioDevices'

const { inputDevices, outputDevices, selectedInputDevice, selectedOutputDevice, selectInputDevice, selectOutputDevice } = useAudioDevices()
</script>

<template>
  <div>
    <h2>Audio Devices</h2>
    <div>
      <h3>Input Devices</h3>
      <ul>
        <li v-for="device in inputDevices" :key="device.deviceId" @click="selectInputDevice(device)">
          {{ device.label || device.deviceId }} {{ selectedInputDevice?.deviceId === device.deviceId ? '(Selected)' : '' }}
        </li>
      </ul>
      <h3>Output Devices</h3>
      <ul>
        <li v-for="device in outputDevices" :key="device.deviceId" @click="selectOutputDevice(device)">
          {{ device.label || device.deviceId }} {{ selectedOutputDevice?.deviceId === device.deviceId ? '(Selected)' : '' }}
        </li>
      </ul>
    </div>
  </div>
</template>
