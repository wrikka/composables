<script setup lang="ts">
import { ref } from "vue";
import { useColor } from "./useColor";

const fromColor = ref("#ff0000");
const toColor = ref("#00ff00");

const color = useColor(fromColor, toColor, { duration: 2000 });

const _randomize = () => {
	fromColor.value = color.value;
	toColor.value = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};
</script>

<template>
  <div>
    <div class="w-25 h-25 border border-gray-300 mb-2.5" :style="{ backgroundColor: color }"></div>
    <button @click="randomize" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Animate to Random Color</button>
  </div>
</template>

