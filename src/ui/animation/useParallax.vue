<script setup lang="ts">
import { computed } from "vue";
import { useParallax } from "./useParallax";

const { roll, tilt } = useParallax();

const _cardStyle = computed(() => ({
	transform: `rotateX(${tilt.value * 20}deg) rotateY(${roll.value * 20}deg)`,
	transition: "transform 0.1s ease-out",
}));

const _layer0Style = computed(() => ({
	transform: `translateX(${roll.value * 10}px) translateY(${tilt.value * 10}px)`,
}));

const _layer1Style = computed(() => ({
	transform: `translateX(${roll.value * 20}px) translateY(${tilt.value * 20}px)`,
}));

const _layer2Style = computed(() => ({
	transform: `translateX(${roll.value * 30}px) translateY(${tilt.value * 30}px)`,
}));
</script>

<template>
  <div class="container">
    <div class="card" :style="cardStyle">
      <div class="layer" :style="layer0Style">Layer 0</div>
      <div class="layer" :style="layer1Style">Layer 1</div>
      <div class="layer" :style="layer2Style">Layer 2</div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 800px;
}

.card {
  width: 200px;
  height: 200px;
  background: #42b883;
  border-radius: 10px;
  position: relative;
  transform-style: preserve-3d;
}

.layer {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
  transition: transform 0.1s ease-out;
}
</style>
