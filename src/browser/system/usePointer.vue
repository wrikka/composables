<template>
  <div ref="target" class="pointer-area">
    <h2>usePointer</h2>
    <p>Pointer Type: {{ pointerType }}</p>
    <p>X: {{ x }}</p>
    <p>Y: {{ y }}</p>
    <p>Pressure: {{ pressure }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePointer } from '../usePointer'

const target = ref(null)
const { x, y, pointerType, pressure } = usePointer({ target })
</script>

<style scoped>
.pointer-area {
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
}
</style>
