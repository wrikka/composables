<template>
  <div>
    <h2>useIntersectionObserver</h2>
    <div class="scroll-container">
      <div class="spacer">Scroll down</div>
      <div ref="target" class="target-element">
        <p>Target Element</p>
        <p>Is visible: {{ isVisible }}</p>
      </div>
      <div class="spacer"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useIntersectionObserver } from '../useIntersectionObserver'

const target = ref(null)
const isVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  isVisible.value = isIntersecting
})
</script>

<style scoped>
.scroll-container {
  height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
}
.spacer {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
}
.target-element {
  height: 100px;
  background-color: #f0f0f0;
  border: 2px solid #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
