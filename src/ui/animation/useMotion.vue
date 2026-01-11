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
  <div class="container">
    <div ref="el" class="box"></div>
  </div>
  <button @click="move">Animate</button>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
.box {
  width: 50px;
  height: 50px;
  background-color: #42b883;
}
</style>
