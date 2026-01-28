<template>
  <div>
    <h2>usePagination</h2>
    <p>Current Page: {{ currentPage }}</p>
    <p>Total Pages: {{ pageCount }}</p>
    <p>Is First Page: {{ isFirstPage }}</p>
    <p>Is Last Page: {{ isLastPage }}</p>

    <h4>Items on current page:</h4>
    <ul>
      <li v-for="item in paginatedList" :key="item.id">{{ item.name }}</li>
    </ul>

    <div>
      <button @click="prev" :disabled="isFirstPage">Previous</button>
      <button @click="next" :disabled="isLastPage">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { usePagination } from "../usePagination";

const list = ref(
	Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` })),
);

const {
	currentPage,
	pageCount,
	isFirstPage,
	isLastPage,
	paginatedList,
	next,
	prev,
} = usePagination(list, { pageSize: 5 });
</script>
