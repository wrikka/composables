<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useResizeObserver } from './useResizeObserver'

const containerRef = ref<HTMLElement>()
const { width, height, observe } = useResizeObserver()

onMounted(() => {
  if (containerRef.value) {
    observe(containerRef.value)
  }
})
</script>

<template>
  <div>
    <h2>Resize Observer</h2>
    <div ref="containerRef" style="width: 100%; height: 200px; border: 1px solid #ccc;">
      <p>Width: {{ width }}px</p>
      <p>Height: {{ height }}px</p>
    </div>
  </div>
</template>
