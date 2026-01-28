<template>
  <div>
    <h2 class="text-xl font-bold">useTable</h2>
    <input v-model="searchTerm" type="text" placeholder="Search..." class="border border-gray-300 rounded px-2.5 py-2" />
    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th @click="setSort('id')" class="cursor-pointer select-none border border-gray-300 px-2 py-2 text-left">ID {{ sortIndicator('id') }}</th>
          <th @click="setSort('name')" class="cursor-pointer select-none border border-gray-300 px-2 py-2 text-left">Name {{ sortIndicator('name') }}</th>
          <th @click="setSort('age')" class="cursor-pointer select-none border border-gray-300 px-2 py-2 text-left">Age {{ sortIndicator('age') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedList" :key="item.id">
          <td class="border border-gray-300 px-2 py-2">{{ item.id }}</td>
          <td class="border border-gray-300 px-2 py-2">{{ item.name }}</td>
          <td class="border border-gray-300 px-2 py-2">{{ item.age }}</td>
        </tr>
      </tbody>
    </table>
    <div class="flex items-center gap-2">
      <button @click="prev" :disabled="isFirstPage" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
      <span>Page {{ currentPage }} of {{ pageCount }}</span>
      <button @click="next" :disabled="isLastPage" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useTable } from "../useTable";

const data = ref([
	{ id: 1, name: "Alice", age: 30 },
	{ id: 2, name: "Bob", age: 25 },
	{ id: 3, name: "Charlie", age: 35 },
	{ id: 4, name: "David", age: 28 },
	{ id: 5, name: "Eve", age: 22 },
	{ id: 6, name: "Frank", age: 40 },
]);

const {
	paginatedList,
	currentPage,
	pageCount,
	isFirstPage,
	isLastPage,
	next,
	prev,
	searchTerm,
	setSort,
	sortState,
} = useTable(data, {
	initialSort: { key: "name", order: "asc" },
	searchKeys: ["name"],
	pageSize: 3,
});

const _sortIndicator = (key) => {
	if (sortState.value.key === key) {
		return sortState.value.order === "asc" ? "🔼" : "🔽";
	}
	return "";
};
</script>
