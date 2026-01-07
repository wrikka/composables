<template>
  <div>
    <h2>useColor</h2>
    <input v-model="colorInput" type="text" placeholder="Enter a color (hex, rgb, etc.)" />
    <div :style="{ backgroundColor: hex, width: '100px', height: '100px', border: '1px solid black' }"></div>
    <p>Hex: {{ hex }}</p>
    <p>RGB: {{ rgb }}</p>
    <p>RGBA: {{ rgba }}</p>
    <p>HSL: {{ hsl }}</p>
    <p>HSLA: {{ hsla }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useColor } from '../useColor'

const colorInput = ref('#ff0000')
const { hex, rgb, rgba, hsl, hsla } = useColor(colorInput)
</script>

<style scoped>
input {
  width: 300px;
  margin-bottom: 10px;
}
</style>
