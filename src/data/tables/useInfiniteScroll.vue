<script setup lang="ts">
import { ref } from 'vue'
import { useInfiniteScroll } from './useInfiniteScroll'

const items = ref(Array.from({ length: 20 }, (_, i) => i + 1))
const container = ref<HTMLElement | null>(null)

const { isLoading, hasMore } = useInfiniteScroll({
  target: container,
  distance: 10,
  onLoad: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const nextItems = Array.from({ length: 10 }, (_, i) => items.value.length + i + 1)
    items.value.push(...nextItems)
    if (items.value.length >= 100) {
      hasMore.value = false
    }
  },
})
</script>

<template>
  <div ref="container" class="container">
    <div v-for="item in items" :key="item" class="item">
      Item #{{ item }}
    </div>
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-if="!hasMore" class="finished">No more items</div>
  </div>
</template>

<style scoped>
.container {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
}
.item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.loading, .finished {
  text-align: center;
  padding: 10px;
  color: #888;
}
</style>
