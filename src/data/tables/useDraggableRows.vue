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
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
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
        class="draggable-row"
      >
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.draggable-row {
  cursor: move;
}
.draggable-row:hover {
  background-color: #f0f0f0;
}
</style>
