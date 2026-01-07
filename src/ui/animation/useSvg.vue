<script setup lang="ts">
import { ref } from 'vue'
import { useSvg } from './useSvg'

const path = ref<SVGPathElement | null>(null)
const { play, reset } = useSvg(path, { duration: 2000 })
</script>

<template>
  <div>
    <svg width="200" height="200" viewBox="0 0 100 100">
      <path
        ref="path"
        d="M 10 10 H 90 V 90 H 10 L 10 10"
        fill="none"
        stroke="#42b883"
        stroke-width="2"
      />
    </svg>
    <button @click="play">Play</button>
    <button @click="reset">Reset</button>
  </div>
</template>
