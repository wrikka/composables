<script setup lang="ts">
import { ref } from "vue";
import { useRow } from "./useRow";

const data = ref([
	{ id: 1, name: "Alice", details: "Details for Alice" },
	{ id: 2, name: "Bob", details: "Details for Bob" },
	{ id: 3, name: "Charlie", details: "Details for Charlie" },
]);

// This demonstrates how you might use useRow within a component that renders rows.
// In a real application, you'd likely instantiate useRow for each row inside a v-for loop.
const _rows = data.value.map((item) => useRow(item));
</script>

<template>
  <table class="w-full border-collapse">
    <thead>
      <tr>
        <th class="border border-gray-300 px-2 py-2 text-left">ID</th>
        <th class="border border-gray-300 px-2 py-2 text-left">Name</th>
        <th class="border border-gray-300 px-2 py-2 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="row in rows" :key="row.item.id">
        <tr 
          :class="row.rowClasses.value"
          @mouseover="row.onMouseover"
          @mouseleave="row.onMouseleave"
        >
          <td class="border border-gray-300 px-2 py-2">{{ row.item.id }}</td>
          <td class="border border-gray-300 px-2 py-2">{{ row.item.name }}</td>
          <td class="border border-gray-300 px-2 py-2">
            <button @click="row.toggleExpand" class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              {{ row.isExpanded.value ? 'Collapse' : 'Expand' }}
            </button>
          </td>
        </tr>
        <tr v-if="row.isExpanded.value">
          <td colspan="3" class="px-2.5 py-2.5 bg-gray-50">{{ row.item.details }}</td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

