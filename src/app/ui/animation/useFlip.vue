<script setup lang="ts">
import { ref } from "vue";
import { useFlip } from "./useFlip";

const items = ref([1, 2, 3, 4, 5]);
const itemRefs = ref<HTMLElement[]>([]);

const { play } = useFlip(itemRefs);

const shuffle = () => {
	play();
	items.value.sort(() => Math.random() - 0.5);
};
</script>

<template>
  <div>
    <button @click="shuffle" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mb-4">Shuffle</button>
    <div class="flex flex-wrap gap-2.5">
      <div
        v-for="(item, index) in items"
        :key="item"
        :ref="(el) => { if (el) itemRefs[index] = el as HTMLElement }"
        class="w-12 h-12 bg-green-600 text-white flex justify-center items-center text-2xl"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>

