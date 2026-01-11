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
  <table>
    <thead>
      <tr>
        <th v-for="header in headers" :key="header.key" @click="sortBy(header.key)">
          {{ header.label }}
          <span v-if="sortKey === header.key">
            {{ sortOrder === 'asc' ? '🔼' : '🔽' }}
          </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in sortedData" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.age }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
th {
  cursor: pointer;
}
</style>
