<script setup lang="ts">
import { ref } from "vue";
import { useScroll } from "./useScroll";

const el = ref<HTMLElement | null>(null);
const { x, y, isScrolling, arrivedState } = useScroll(el);
</script>

<template>
  <div>
    <div ref="el" class="w-75 h-50 overflow-scroll border border-gray-300 mb-2.5">
      <div class="w-125 h-100" style="background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%); background-size: 20px 20px;">
        <p>Scroll me!</p>
      </div>
    </div>
    <div class="info">
      <p class="my-0.5">x: {{ x }}</p>
      <p class="my-0.5">y: {{ y }}</p>
      <p class="my-0.5">Is Scrolling: {{ isScrolling }}</p>
      <p class="my-0.5">Arrived Top: {{ arrivedState.top.value }}</p>
      <p class="my-0.5">Arrived Bottom: {{ arrivedState.bottom.value }}</p>
    </div>
  </div>
</template>

