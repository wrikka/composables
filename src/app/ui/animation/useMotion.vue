<script setup lang="ts">
import { ref } from "vue";
import { useMotion } from "./useMotion";

const el = ref<HTMLElement | null>(null);

const { set } = useMotion(el, {
	x: 0,
	y: 0,
	scale: 1,
	opacity: 1,
});

const _move = () => {
	set({
		x: Math.random() * 200 - 100,
		y: Math.random() * 200 - 100,
		scale: Math.random() * 1 + 0.5,
		opacity: Math.random() * 0.5 + 0.5,
	});
};
</script>

<template>
  <div class="flex justify-center items-center h-50">
    <div ref="el" class="w-12 h-12 bg-green-600"></div>
  </div>
  <button @click="move" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Animate</button>
</template>

