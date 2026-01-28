<script setup lang="ts">
import { ref } from "vue";
import { useSort } from "./useSort";

const data = ref([
	{ id: 3, name: "Charlie", age: 30 },
	{ id: 1, name: "Alice", age: 25 },
	{ id: 2, name: "Bob", age: 35 },
]);

const { sortedData, sortBy, sortKey, sortOrder } = useSort(data);

const _headers = [
	{ key: "id", label: "ID" },
	{ key: "name", label: "Name" },
	{ key: "age", label: "Age" },
] as const;
</script>

<template>
  <table class="w-full border-collapse">
    <thead>
      <tr>
        <th v-for="header in headers" :key="header.key" @click="sortBy(header.key)" class="cursor-pointer border border-gray-300 px-2 py-2 text-left">
          {{ header.label }}
          <span v-if="sortKey === header.key">
            {{ sortOrder === 'asc' ? '🔼' : '🔽' }}
          </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in sortedData" :key="item.id">
        <td class="border border-gray-300 px-2 py-2">{{ item.id }}</td>
        <td class="border border-gray-300 px-2 py-2">{{ item.name }}</td>
        <td class="border border-gray-300 px-2 py-2">{{ item.age }}</td>
      </tr>
    </tbody>
  </table>
</template>
