<template>
  <div ref="scrollContainer" class="scroll-container">
    <h2>useScroll</h2>
    <div class="scroll-content">
      <p>Scroll position:</p>
      <p>x: {{ x }}</p>
      <p>y: {{ y }}</p>
      <p>Is scrolling: {{ isScrolling }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useScroll } from "../useScroll";

const scrollContainer = ref(null);
const { x, y, isScrolling } = useScroll(scrollContainer);
</script>

<style scoped>
.scroll-container {
  width: 300px;
  height: 200px;
  overflow: auto;
  border: 1px solid #ccc;
  padding: 10px;
}
.scroll-content {
  width: 500px;
  height: 500px;
  background-image: linear-gradient(to top right, #f0f0f0, #ffffff);
}
</style>
