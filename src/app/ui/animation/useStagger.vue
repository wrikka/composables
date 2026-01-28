<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useStagger } from "./useStagger";

const itemRefs = ref<HTMLElement[]>([]);

const keyframes = [
	{ opacity: 0, transform: "translateY(20px)" },
	{ opacity: 1, transform: "translateY(0)" },
];

const { play } = useStagger(itemRefs, keyframes, {
	stagger: 100,
	duration: 500,
	easing: "ease-out",
});

onMounted(() => {
	play();
});
</script>

<template>
  <div>
    <button @click="play" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mb-4">Animate In</button>
    <ul class="list-none p-0">
      <li v-for="i in 5" :key="i" :ref="(el) => { if (el) itemRefs.push(el as HTMLElement) }" class="bg-green-600 text-white px-2.5 py-2.5 mb-1.25 rounded opacity-0">
        Item {{ i }}
      </li>
    </ul>
  </div>
</template>

