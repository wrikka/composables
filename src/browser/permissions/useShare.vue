<script setup lang="ts">
import { useShare } from './useShare'

const { isSupported, share, shared } = useShare()

const startShare = () => {
  share({
    title: 'Hello',
    text: 'Check out this awesome composable!',
    url: location.href,
  })
}
</script>

<template>
  <div class="p-4 border rounded space-y-2">
    <h2 class="text-lg font-bold">Share API</h2>
    <p v-if="!isSupported">Share API not supported</p>
    <template v-else>
      <button class="btn" @click="startShare">Share This Page</button>
      <p v-if="shared" class="text-green-500">Shared successfully!</p>
    </template>
  </div>
</template>
