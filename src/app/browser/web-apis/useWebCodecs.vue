<script setup lang="ts">
import { useWebCodecs } from './useWebCodecs'

const { encodeVideo, decodeVideo, isEncoding, isDecoding, error } = useWebCodecs()

const handleEncode = async () => {
  await encodeVideo({ width: 1920, height: 1080 } as VideoFrame)
}

const handleDecode = async () => {
  await decodeVideo({} as EncodedVideoChunk)
}
</script>

<template>
  <div>
    <h2>WebCodecs</h2>
    <div>
      <button @click="handleEncode" :disabled="isEncoding">
        {{ isEncoding ? 'Encoding...' : 'Encode' }}
      </button>
      <button @click="handleDecode" :disabled="isDecoding">
        {{ isDecoding ? 'Decoding...' : 'Decode' }}
      </button>
      <div v-if="error">
        <p>Error: {{ error.message }}</p>
      </div>
    </div>
  </div>
</template>
