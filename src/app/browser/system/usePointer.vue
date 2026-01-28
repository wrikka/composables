<template>
  <div ref="target" class="w-full h-50 bg-gray-100 border border-gray-300 flex flex-col justify-center items-center select-none">
    <h2 class="text-xl font-bold">usePointer</h2>
    <p>Pointer Type: {{ pointerType }}</p>
    <p>X: {{ x }}</p>
    <p>Y: {{ y }}</p>
    <p>Pressure: {{ pressure }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { usePointer } from "../usePointer";

const target = ref(null);
const { x, y, pointerType, pressure } = usePointer({ target });
</script>
