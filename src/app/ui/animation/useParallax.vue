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
  <div class="w-full h-75 flex justify-center items-center perspective-[800px]">
    <div class="w-50 h-50 bg-green-600 rounded-lg relative transform-style-3d" :style="_cardStyle">
      <div class="absolute w-full h-full flex justify-center items-center text-white text-xl transition-transform duration-100 ease-out" :style="_layer0Style">Layer 0</div>
      <div class="absolute w-full h-full flex justify-center items-center text-white text-xl transition-transform duration-100 ease-out" :style="_layer1Style">Layer 1</div>
      <div class="absolute w-full h-full flex justify-center items-center text-white text-xl transition-transform duration-100 ease-out" :style="_layer2Style">Layer 2</div>
    </div>
  </div>
</template>
