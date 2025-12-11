<script setup lang="ts">
import { usePermission } from './usePermission'

const { status: cameraStatus, query } = usePermission('camera')
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Permissions API</h2>
    <p>Camera permission status: <strong class="font-mono">{{ cameraStatus }}</strong></p>
    <button class="btn" @click="query">Query Camera Status</button>
  </div>
</template>
