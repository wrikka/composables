<script setup lang="ts">
import { useScreenShare } from './useScreenShare'

const { isSharing, stream, error, startShare, stopShare } = useScreenShare()
</script>

<template>
  <div>
    <h2>Screen Share</h2>
    <div>
      <p>Status: {{ isSharing ? 'Sharing' : 'Not Sharing' }}</p>
      <button @click="startShare">Start Share</button>
      <button @click="stopShare">Stop Share</button>
      <p v-if="error">Error: {{ error.message }}</p>
    </div>
  </div>
</template>
