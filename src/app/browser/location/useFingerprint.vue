<script setup lang="ts">
import { useFingerprint } from './useFingerprint'

const {
  fingerprint,
  isLoading,
  error,
  generate,
} = useFingerprint()
</script>

<template>
  <div class="p-5 border border-gray-300 rounded-lg">
    <h2>Fingerprint Demo</h2>
    <div class="my-2.5">
      <p>Loading: {{ isLoading }}</p>
    </div>
    <div class="my-3.75">
      <button class="px-4 py-2 cursor-pointer" @click="generate">Generate Fingerprint</button>
    </div>
    <div class="mt-3.75" v-if="fingerprint">
      <h3>Fingerprint Info</h3>
      <p class="my-1.25">User Agent: {{ fingerprint.userAgent }}</p>
      <p class="my-1.25">Language: {{ fingerprint.language }}</p>
      <p class="my-1.25">Platform: {{ fingerprint.platform }}</p>
      <p class="my-1.25">Screen Resolution: {{ fingerprint.screenResolution }}</p>
      <p class="my-1.25">Color Depth: {{ fingerprint.colorDepth }}</p>
      <p class="my-1.25">Timezone: {{ fingerprint.timezone }}</p>
      <p class="my-1.25">Session Storage: {{ fingerprint.sessionStorage }}</p>
      <p class="my-1.25">Local Storage: {{ fingerprint.localStorage }}</p>
      <p class="my-1.25">IndexedDB: {{ fingerprint.indexedDB }}</p>
      <p class="my-1.25">WebGL: {{ fingerprint.webGL }}</p>
      <p class="my-1.25">Canvas: {{ fingerprint.canvas }}</p>
      <p class="my-1.25">Hash: {{ fingerprint.hash }}</p>
    </div>
    <div class="my-2.5 text-red-500" v-if="error">
      <p>Error: {{ error.message }}</p>
    </div>
  </div>
</template>

