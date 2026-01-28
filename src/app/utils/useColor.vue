<template>
  <div>
    <h2 class="text-xl font-bold">useColor</h2>
    <input v-model="colorInput" type="text" placeholder="Enter a color (hex, rgb, etc.)" class="w-75 mb-2.5 border border-gray-300 rounded px-2.5 py-2" />
    <div :style="{ backgroundColor: hex }" class="w-25 h-25 border border-black"></div>
    <p>Hex: {{ hex }}</p>
    <p>RGB: {{ rgb }}</p>
    <p>RGBA: {{ rgba }}</p>
    <p>HSL: {{ hsl }}</p>
    <p>HSLA: {{ hsla }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useColor } from "../useColor";

const colorInput = ref("#ff0000");
const { hex, rgb, rgba, hsl, hsla } = useColor(colorInput);
</script>
