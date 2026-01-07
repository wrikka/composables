<script setup lang="ts">
import { ref } from 'vue'
import { useColor } from './useColor'

const fromColor = ref('#ff0000')
const toColor = ref('#00ff00')

const color = useColor(fromColor, toColor, { duration: 2000 })

const randomize = () => {
  fromColor.value = color.value
  toColor.value = `#${Math.floor(Math.random() * 16777215).toString(16)}`
}
</script>

<template>
  <div>
    <div class="box" :style="{ backgroundColor: color }"></div>
    <button @click="randomize">Animate to Random Color</button>
  </div>
</template>

<style scoped>
.box {
  width: 100px;
  height: 100px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}
</style>
