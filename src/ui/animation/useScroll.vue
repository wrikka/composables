<script setup lang="ts">
import { ref } from "vue";
import { useScroll } from "./useScroll";

const el = ref<HTMLElement | null>(null);
const { x, y, isScrolling, arrivedState } = useScroll(el);
</script>

<template>
  <div>
    <div ref="el" class="scroll-container">
      <div class="content">
        <p>Scroll me!</p>
      </div>
    </div>
    <div class="info">
      <p>x: {{ x }}</p>
      <p>y: {{ y }}</p>
      <p>Is Scrolling: {{ isScrolling }}</p>
      <p>Arrived Top: {{ arrivedState.top.value }}</p>
      <p>Arrived Bottom: {{ arrivedState.bottom.value }}</p>
    </div>
  </div>
</template>

<style scoped>
.scroll-container {
  width: 300px;
  height: 200px;
  overflow: scroll;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.content {
  width: 500px;
  height: 400px;
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
}

.info p {
  margin: 2px 0;
}
</style>
