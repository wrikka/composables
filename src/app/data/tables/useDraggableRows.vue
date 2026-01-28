<script setup lang="ts">
import { ref } from "vue";
import { useDraggableRows } from "./useDraggableRows";

const initialData = ref([
	{ id: 1, name: "Alice" },
	{ id: 2, name: "Bob" },
	{ id: 3, name: "Charlie" },
	{ id: 4, name: "David" },
]);

const { list, onDragStart, onDragOver, onDrop } = useDraggableRows(initialData);
</script>

<template>
  <table class="w-full border-collapse">
    <thead>
      <tr>
        <th class="border border-gray-300 px-4 py-2 text-left">ID</th>
        <th class="border border-gray-300 px-4 py-2 text-left">Name</th>
      </tr>
    </thead>
    <tbody>
      <tr 
        v-for="item in list" 
        :key="item.id"
        draggable="true"
        @dragstart="onDragStart(item)"
        @dragover.prevent="onDragOver"
        @drop="onDrop(item)"
        class="cursor-move hover:bg-gray-100"
      >
        <td class="border border-gray-300 px-4 py-2">{{ item.id }}</td>
        <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
      </tr>
    </tbody>
  </table>
</template>
