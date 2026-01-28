<script setup lang="ts">
import { ref } from "vue";
import { useInfiniteScroll } from "./useInfiniteScroll";

const items = ref(Array.from({ length: 20 }, (_, i) => i + 1));
const container = ref<HTMLElement | null>(null);

const { isLoading, hasMore } = useInfiniteScroll({
	target: container,
	distance: 10,
	onLoad: async () => {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
		const nextItems = Array.from(
			{ length: 10 },
			(_, i) => items.value.length + i + 1,
		);
		items.value.push(...nextItems);
		if (items.value.length >= 100) {
			hasMore.value = false;
		}
	},
});
</script>

<template>
  <div ref="container" class="h-75 overflow-y-auto border border-gray-300 p-2.5">
    <div v-for="item in items" :key="item" class="p-2.5 border-b border-gray-200">
      Item #{{ item }}
    </div>
    <div v-if="isLoading" class="text-center p-2.5 text-gray-500">Loading...</div>
    <div v-if="!hasMore" class="text-center p-2.5 text-gray-500">No more items</div>
  </div>
</template>
